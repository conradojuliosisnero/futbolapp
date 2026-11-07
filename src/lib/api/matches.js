import 'server-only';
import { fd } from './football-data';
import { liveFixtures } from './api-football';
import { sameTeam } from './team-match.mjs';
import { LEAGUES, leagueEmblem } from '@/config/leagues';
import { siteConfig } from '@/config/site';

// Capa de datos real. Presupuesto de consultas (ver README → APIs):
//   football-data (10/min): ventana de partidos 60 s · tablas 1 h · partidos de un equipo 10 min.
//   API-Football (100/día): solo eventos en vivo del detalle de partido, 15 min.
const CODES = LEAGUES.map((l) => l.code);
const TZ = siteConfig.timeZone;

// ---------- fechas (zona horaria de la app) ----------
const DAY = 86_400_000;
const dayKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date); // 2026-11-07
const time = (date) => new Intl.DateTimeFormat('es', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
function dayLabel(date) {
  const k = dayKey(date), now = Date.now();
  if (k === dayKey(now)) return null;
  if (k === dayKey(now + DAY)) return 'Mañana';
  if (k === dayKey(now - DAY)) return 'Ayer';
  return new Intl.DateTimeFormat('es', { timeZone: TZ, weekday: 'short', day: 'numeric' }).format(date);
}
export function todayLabel() {
  return new Intl.DateTimeFormat('es', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(Date.now());
}

// ---------- normalización football-data → forma de la app ----------
const LIVE = new Set(['IN_PLAY', 'PAUSED']);
const DONE = new Set(['FINISHED', 'AWARDED']);
const OTHER = { POSTPONED: 'Aplaz.', SUSPENDED: 'Susp.', CANCELLED: 'Canc.' };
const STAGES = {
  LEAGUE_STAGE: 'Fase de liga', GROUP_STAGE: 'Fase de grupos', PLAYOFFS: 'Playoffs', LAST_32: 'Dieciseisavos',
  LAST_16: 'Octavos', QUARTER_FINALS: 'Cuartos', SEMI_FINALS: 'Semifinal', THIRD_PLACE: 'Tercer puesto', FINAL: 'Final',
};
const leagueName = (code, fallback) => LEAGUES.find((l) => l.code === code)?.name ?? fallback;

const team = (t) => ({
  id: t.id,
  code: t.tla || (t.shortName || t.name || '?').slice(0, 3).toUpperCase(),
  name: t.shortName || t.name,
  crest: t.crest ?? null,
});

// shortcut: football-data gratis no trae el minuto; se estima desde la hora de inicio (~15 min de entretiempo).
function liveMinute(m) {
  if (m.status === 'PAUSED') return 'MT';
  const mins = Math.floor((Date.now() - Date.parse(m.utcDate)) / 60000);
  if (mins <= 45) return `${Math.max(1, mins)}'`;
  if (mins < 60) return "45+'";
  return mins - 15 > 90 ? "90+'" : `${mins - 15}'`;
}

function toMatch(m) {
  const date = Date.parse(m.utcDate);
  const status = LIVE.has(m.status) ? 'live' : DONE.has(m.status) ? 'finished' : 'scheduled';
  const minute = status === 'live' ? liveMinute(m) : null;
  return {
    id: String(m.id),
    utc: date,
    leagueId: m.competition.code,
    league: leagueName(m.competition.code, m.competition.name),
    round: m.matchday ? `Jornada ${m.matchday}` : STAGES[m.stage] ?? '',
    status,
    minute,
    clock: minute,
    progress: minute ? Math.min(1, (parseInt(minute, 10) || 45) / 90) : 0,
    kickoff: time(date),
    day: dayLabel(date),
    // Columna izquierda de la fila: minuto en vivo, "Final" o la hora.
    label: minute ?? (status === 'finished' ? 'Final' : OTHER[m.status] ?? time(date)),
    home: team(m.homeTeam),
    away: team(m.awayTeam),
    score: status === 'scheduled' ? undefined : [m.score.fullTime.home ?? 0, m.score.fullTime.away ?? 0],
  };
}

const byLeagueOrder = (a, b) => CODES.indexOf(a.leagueId) - CODES.indexOf(b.leagueId) || a.utc - b.utc;

function groupByLeague(list) {
  const groups = {};
  for (const m of [...list].sort(byLeagueOrder)) {
    (groups[m.leagueId] ??= { leagueId: m.leagueId, league: m.league, matches: [] }).matches.push(m);
  }
  return Object.values(groups);
}

// ---------- consultas base ----------

/** Todos los partidos de las ligas configuradas, de hace 3 días a dentro de 6 (máx. 10 días por consulta). */
async function windowMatches() {
  const from = dayKey(Date.now() - 3 * DAY), to = dayKey(Date.now() + 6 * DAY);
  const data = await fd(`/matches?competitions=${CODES.join(',')}&dateFrom=${from}&dateTo=${to}`, { revalidate: 60 });
  return (data.matches ?? []).map(toMatch);
}

async function standingsOf(code) {
  try {
    const data = await fd(`/competitions/${code}/standings`, { revalidate: 3600 });
    const groups = (data.standings ?? []).filter((s) => s.type === 'TOTAL').map((s) => ({
      name: s.group ? s.group.replace('GROUP_', 'Grupo ') : null,
      rows: s.table.map((r) => ({
        team: team(r.team), played: r.playedGames, won: r.won, drawn: r.draw, lost: r.lost,
        gd: r.goalDifference, pts: r.points, form: r.form ? r.form.replace(/,/g, '').replace(/W/g, 'G').replace(/D/g, 'E').replace(/L/g, 'P') : null,
      })),
    }));
    return { groups, season: data.season };
  } catch (e) {
    if (String(e.message).includes(' 404 ')) return { groups: [], season: null }; // copa sin tabla (eliminatorias)
    throw e;
  }
}

// ---------- eventos en vivo (API-Football) ----------

function toEvent(e, homeName) {
  const min = `${e.time.elapsed}${e.time.extra ? `+${e.time.extra}` : ''}'`;
  const who = e.player?.name ?? '';
  const side = sameTeam(e.team?.name ?? '', homeName) ? 'home' : 'away';
  if (e.type === 'Goal') {
    if (e.detail === 'Missed Penalty') return { min, side, type: 'var', title: `Penal fallado · ${who}` };
    const extra = e.detail === 'Penalty' ? ' (penal)' : e.detail === 'Own Goal' ? ' (autogol)' : '';
    return { min, side, type: 'goal', title: `¡GOL! ${e.team.name}`, text: `${who}${extra}${e.assist?.name ? ` · asistencia de ${e.assist.name}` : ''}` };
  }
  if (e.type === 'Card') return { min, side, type: e.detail.includes('Red') ? 'red' : 'yellow', title: `${e.detail.includes('Red') ? 'Roja' : 'Amarilla'} · ${who} (${e.team.name})` };
  if (e.type === 'subst') return { min, side, type: 'sub', title: `Cambio · ${e.team.name}`, text: `${who} ↔ ${e.assist?.name ?? ''}` };
  return { min, side, type: 'var', title: `VAR · ${e.detail}` };
}

async function withLiveEvents(match) {
  const fixture = (await liveFixtures()).find(
    (f) => sameTeam(f.teams.home.name, match.home.name) && sameTeam(f.teams.away.name, match.away.name),
  );
  if (!fixture) return match;
  const events = fixture.events.map((e) => toEvent(e, fixture.teams.home.name));
  const goals = (side) => events.filter((e) => e.type === 'goal' && e.side === side).map((e) => `${e.text.split(' (')[0].split(' · ')[0]} ${e.min}`);
  return { ...match, events: events.reverse(), scorers: { home: goals('home'), away: goals('away') } };
}

// ---------- funciones que usan las pantallas ----------

export async function getFeaturedMatch() {
  const all = await windowMatches();
  const now = Date.now();
  return all.filter((m) => m.status === 'live').sort(byLeagueOrder)[0]
    ?? all.filter((m) => m.status === 'scheduled' && m.utc > now).sort((a, b) => a.utc - b.utc)[0]
    ?? all.filter((m) => m.status === 'finished').sort((a, b) => b.utc - a.utc)[0]
    ?? null;
}

export async function getMatch(id) {
  let match = (await windowMatches()).find((m) => m.id === String(id));
  if (!match) {
    // Partido fuera de la ventana: una consulta propia, con caché larga (ya no cambia).
    try { match = toMatch(await fd(`/matches/${encodeURIComponent(id)}`, { revalidate: 3600 })); }
    catch (e) { if (/ (400|404) /.test(e.message)) return null; throw e; }
  }
  return match.status === 'live' ? withLiveEvents(match) : match;
}

export async function getLiveCount() {
  return (await windowMatches()).filter((m) => m.status === 'live').length;
}

export async function getTodayByLeague() {
  const today = dayKey(Date.now());
  return groupByLeague((await windowMatches()).filter((m) => dayKey(m.utc) === today));
}

// shortcut: sin fuente de videos todavía (API-Football y football-data no los tienen); la sección se oculta.
export async function getHighlights() {
  return [];
}

/** { live, scheduled, finished } agrupados por liga. */
export async function getMatchesByStatus() {
  const all = await windowMatches();
  return {
    live: groupByLeague(all.filter((m) => m.status === 'live')),
    scheduled: groupByLeague(all.filter((m) => m.status === 'scheduled')),
    finished: groupByLeague(all.filter((m) => m.status === 'finished').sort((a, b) => b.utc - a.utc)),
  };
}

export async function getLeagues() {
  const all = await windowMatches();
  return LEAGUES.map((l) => {
    const ms = all.filter((m) => m.leagueId === l.code);
    return { ...l, id: l.code, emblem: leagueEmblem(l.code), live: ms.filter((m) => m.status === 'live').length, total: ms.length };
  });
}

const STATUS_ORDER = { live: 0, scheduled: 1, finished: 2 };

export async function getLeague(code) {
  const conf = LEAGUES.find((l) => l.code === code);
  if (!conf) return null;
  const [{ groups, season }, all] = await Promise.all([standingsOf(code), windowMatches()]);
  return {
    ...conf,
    id: code,
    emblem: leagueEmblem(code),
    season: season ? `${season.startDate.slice(0, 4)}/${season.endDate.slice(2, 4)}` : '',
    round: season?.currentMatchday ? `Jornada ${season.currentMatchday}` : '',
    groups,
    matches: all.filter((m) => m.leagueId === code).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.utc - b.utc),
  };
}

/** Resumen de un equipo: posición en su liga, tabla, forma y partidos (±30 días). */
export async function getTeamOverview(teamId, leagueCode) {
  const from = dayKey(Date.now() - 30 * DAY), to = dayKey(Date.now() + 30 * DAY);
  const [{ groups }, data] = await Promise.all([
    standingsOf(leagueCode),
    fd(`/teams/${teamId}/matches?dateFrom=${from}&dateTo=${to}`, { revalidate: 600 }),
  ]);
  const matches = (data.matches ?? []).map(toMatch);
  const rows = groups.find((g) => g.rows.some((r) => r.team.id === teamId))?.rows ?? [];
  const idx = rows.findIndex((r) => r.team.id === teamId);
  const fromMatch = matches.find((m) => m.home.id === teamId) ?? matches.find((m) => m.away.id === teamId);
  const me = idx >= 0 ? rows[idx].team : fromMatch && (fromMatch.home.id === teamId ? fromMatch.home : fromMatch.away);
  if (!me) return null;

  // Forma de los últimos 5 partidos terminados (football-data gratis no la trae en la tabla).
  const form = matches.filter((m) => m.status === 'finished').sort((a, b) => b.utc - a.utc).slice(0, 5).map((m) => {
    const [h, a] = m.score; const mine = m.home.id === teamId ? h - a : a - h;
    return mine > 0 ? 'G' : mine === 0 ? 'E' : 'P';
  }).join('');

  return {
    team: me,
    league: { ...LEAGUES.find((l) => l.code === leagueCode), id: leagueCode },
    position: idx >= 0 ? idx + 1 : null,
    standing: idx >= 0 ? { ...rows[idx], form } : null,
    form,
    standings: rows,
    matches,
  };
}
