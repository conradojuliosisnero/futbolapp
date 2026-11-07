import 'server-only';
import { fd } from './football-data';
import { liveFixtures, fixturesOnDate, lineups, statistics, events, searchTeams, squad as afSquad, playerProfile, playerPhoto } from './api-football';
import { sameTeam, bestTeamMatch, searchTerm, tokens } from './team-match.mjs';
import { unstable_cache } from 'next/cache';
import * as espn from './espn';
import { DAY, dayKey, time, dayLabel, todayLabel } from './dates';
import { LEAGUES, leagueEmblem, leagueByCode, isEspnLeague } from '@/config/leagues';

export { todayLabel };

// Capa de datos real. Presupuesto de consultas (ver README → APIs):
//   football-data (10/min): ventana de partidos 60 s · tablas 1 h · partidos de un equipo 10 min.
//   ESPN (no oficial, sin clave): ligas sin football-data (Colombia, Argentina, México, MLS), minuto real,
//     detalle de partido (eventos, relato, estadísticas, alineaciones) y noticias. Si falla, se usa lo demás.
//   API-Football (100/día): respaldo del detalle de partido cuando ESPN no lo tiene (ver api-football.js).
const CODES = LEAGUES.map((l) => l.code);                         // orden de la app
const FD_CODES = LEAGUES.filter((l) => !l.source).map((l) => l.code); // las que salen de football-data

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
  const [data, ...espnLists] = await Promise.all([
    fd(`/matches?competitions=${FD_CODES.join(',')}&dateFrom=${from}&dateTo=${to}`, { revalidate: 60 }),
    ...LEAGUES.filter((l) => l.source === 'espn').map((l) => espn.leagueWindow(l)),
  ]);
  const fdMatches = await withRealMinute((data.matches ?? []).map(toMatch));
  const all = [...fdMatches, ...espnLists.flat()];
  Object.defineProperty(all, 'fetchedAt', { value: data.fetchedAt });
  return all;
}

/** football-data gratis no trae el minuto: si ESPN tiene el mismo partido en vivo, se usa su reloj (y su marcador). */
async function withRealMinute(matches) {
  const liveLeagues = [...new Set(matches.filter((m) => m.status === 'live').map((m) => m.leagueId))];
  if (!liveLeagues.length) return matches;
  const boards = Object.fromEntries(await Promise.all(liveLeagues.map(async (code) => {
    const slug = leagueByCode(code)?.espn;
    const lg = leagueByCode(code);
    return [code, slug ? (await espn.scoreboard(slug)).map((ev) => espn.toMatch(ev, slug, lg)) : []];
  })));
  return matches.map((m) => {
    if (m.status !== 'live') return m;
    const e = boards[m.leagueId]?.find((x) => x.status === 'live' && sameTeam(x.home.name, m.home.name) && sameTeam(x.away.name, m.away.name));
    return e ? { ...m, minute: e.minute, clock: e.clock, liveClock: e.liveClock, label: e.label, progress: e.progress, score: e.score } : m;
  });
}

async function standingsOf(code) {
  if (isEspnLeague(code)) return espn.standings(leagueByCode(code).espn);
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
    if (/ (403|404|429) /.test(String(e.message))) return { groups: [], season: null }; // sin tabla, fuera del plan o límite: se muestra sin ella
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
    return { min, side, player: who, type: 'goal', title: `¡GOL! ${e.team.name}`, text: `${who}${extra}${e.assist?.name ? ` · asistencia de ${e.assist.name}` : ''}` };
  }
  if (e.type === 'Card') return { min, side, type: e.detail.includes('Red') ? 'red' : 'yellow', title: `${e.detail.includes('Red') ? 'Roja' : 'Amarilla'} · ${who} (${e.team.name})` };
  if (e.type === 'subst') return { min, side, type: 'sub', title: `Cambio · ${e.team.name}`, text: `${who} ↔ ${e.assist?.name ?? ''}` };
  return { min, side, type: 'var', title: `VAR · ${e.detail}` };
}

// ---------- estadísticas y alineaciones (API-Football) ----------

const STAT_LABELS = [
  ['Ball Possession', 'Posesión %'], ['expected_goals', 'Goles esperados (xG)'], ['Total Shots', 'Tiros'],
  ['Shots on Goal', 'Tiros a puerta'], ['Corner Kicks', 'Córners'], ['Fouls', 'Faltas'], ['Offsides', 'Fueras de juego'],
  ['Yellow Cards', 'Amarillas'], ['Red Cards', 'Rojas'], ['Goalkeeper Saves', 'Atajadas'], ['Total passes', 'Pases'],
  ['Passes %', 'Precisión de pase %'],
];
const num = (v) => (v == null ? 0 : parseFloat(String(v)) || 0);
// API-Football no garantiza el orden local/visitante: se ubica por nombre.
const homeFirst = (resp, homeName) => (sameTeam(resp[0].team.name, homeName) ? [resp[0], resp[1]] : [resp[1], resp[0]]);

function toStats(resp, homeName) {
  if (!resp || resp.length < 2) return [];
  const [h, a] = homeFirst(resp, homeName);
  const val = (t, type) => t.statistics.find((x) => x.type === type)?.value;
  return STAT_LABELS.filter(([type]) => val(h, type) != null || val(a, type) != null)
    .map(([type, label]) => ({ label, home: num(val(h, type)), away: num(val(a, type)) }));
}

const POS = { G: 'POR', D: 'DEF', M: 'MED', F: 'DEL' };
function toLineups(resp, homeName) {
  if (!resp || resp.length < 2) return null;
  const player = (x) => ({ id: x.player.id, number: x.player.number, name: x.player.name, pos: POS[x.player.pos] ?? x.player.pos ?? '', grid: x.player.grid, photo: x.player.id ? playerPhoto(x.player.id) : null });
  const side = (t) => ({ formation: t.formation, coach: t.coach?.name, startXI: t.startXI.map(player), subs: t.substitutes.map(player) });
  const [h, a] = homeFirst(resp, homeName);
  return { home: side(h), away: side(a) };
}

/** Busca el mismo partido en API-Football (en vivo, o por fecha). */
async function findFixture(match) {
  const same = (h, a) => sameTeam(h, match.home.name) && sameTeam(a, match.away.name);
  if (match.status === 'live') {
    const f = (await liveFixtures()).find((x) => same(x.teams.home.name, x.teams.away.name));
    if (f) return { id: f.fixture.id, liveEvents: f.events };
  }
  try {
    const f = (await fixturesOnDate(new Date(match.utc).toISOString().slice(0, 10))).find((x) => same(x.home, x.away));
    return f ? { id: f.id } : null;
  } catch { return null; }
}

/** Detalle desde ESPN (eventos, relato, estadísticas, alineaciones). null si ESPN no tiene el partido. */
async function espnDetails(match) {
  const slug = match.espn?.slug ?? leagueByCode(match.leagueId)?.espn;
  if (!slug) return null;
  const eventId = match.espn?.id ?? (await espn.findEvent(slug, match))?.id;
  if (!eventId) return null;
  const d = await espn.matchDetails(slug, eventId, match.status);
  if (!d || (!d.events.length && !d.stats.length && !d.lineups && !d.commentary.length)) return null;
  const { header, ...rest } = d;
  return { ...match, ...rest };
}

/** Agrega eventos, goleadores, estadísticas y alineaciones. Lo que la API no tenga, simplemente no aparece. */
async function withDetails(match) {
  const fromEspn = await espnDetails(match).catch(() => null);
  if (fromEspn) return fromEspn;
  if (match.espn) return match; // ligas solo de ESPN: API-Football no las tiene emparejadas

  // Las alineaciones se publican ~1 h antes; antes de eso no se gasta cuota.
  if (match.status === 'scheduled' && match.utc - Date.now() > 60 * 60000) return match;
  const fx = await findFixture(match);
  if (!fx) return match;
  const [lu, st, ev] = await Promise.all([
    lineups(fx.id),
    match.status !== 'scheduled' ? statistics(fx.id, match.status === 'live') : null,
    match.status === 'finished' ? events(fx.id) : null,
  ]);
  const evs = (fx.liveEvents ?? ev ?? []).map((e) => toEvent(e, match.home.name));
  const goals = (side) => evs.filter((e) => e.type === 'goal' && e.side === side).map((e) => `${e.player} ${e.min}`);
  return {
    ...match,
    events: evs.reverse(),
    scorers: evs.length ? { home: goals('home'), away: goals('away') } : undefined,
    stats: toStats(st, match.home.name),
    lineups: toLineups(lu, match.home.name),
  };
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

/** details: true agrega eventos, estadísticas y alineaciones (gasta API-Football; solo en la página del partido). */
export async function getMatch(id, { details = false } = {}) {
  let match = (await windowMatches()).find((m) => m.id === String(id));
  const eid = espn.parseEspnId(id);
  if (!match && eid) {
    // Partido de ESPN fuera de la ventana: se arma desde su resumen.
    const lg = LEAGUES.find((l) => l.espn === eid.slug && l.source === 'espn');
    const d = lg && await espn.matchDetails(eid.slug, eid.id, 'finished');
    if (!d?.header) return null;
    match = espn.toMatch(d.header, eid.slug, lg);
  }
  if (!match) {
    if (!/^\d+$/.test(String(id))) return null;
    // Partido fuera de la ventana: una consulta propia, con caché larga (ya no cambia).
    try { match = toMatch(await fd(`/matches/${encodeURIComponent(id)}`, { revalidate: 3600 })); }
    catch (e) { if (/ (400|404) /.test(e.message)) return null; throw e; }
  }
  return details ? withDetails(match) : match;
}

/** Cuándo se consultaron de verdad los partidos (para recargar si la caché entregó datos viejos). */
export async function getDataTime() {
  return (await windowMatches()).fetchedAt ?? Date.now();
}

export async function getLiveCount() {
  return (await windowMatches()).filter((m) => m.status === 'live').length;
}

export async function getTodayByLeague() {
  const today = dayKey(Date.now());
  return groupByLeague((await windowMatches()).filter((m) => dayKey(m.utc) === today));
}

/** Listas del inicio: en vivo, hoy y mañana, agrupadas por liga. */
export async function getHomeLists() {
  const all = await windowMatches();
  const today = dayKey(Date.now()), tomorrow = dayKey(Date.now() + DAY);
  return {
    live: groupByLeague(all.filter((m) => m.status === 'live')),
    today: groupByLeague(all.filter((m) => dayKey(m.utc) === today)),
    tomorrow: groupByLeague(all.filter((m) => dayKey(m.utc) === tomorrow)),
  };
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
  const [{ groups, season }, all, scorers] = await Promise.all([standingsOf(code), windowMatches(), getScorers(code)]);
  return {
    ...conf,
    id: code,
    emblem: leagueEmblem(code),
    season: season?.startDate ? `${season.startDate.slice(0, 4)}/${season.endDate.slice(2, 4)}` : season?.displayName ?? '',
    round: season?.currentMatchday ? `Jornada ${season.currentMatchday}` : '',
    groups,
    scorers,
    matches: all.filter((m) => m.leagueId === code).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.utc - b.utc),
  };
}

/** Goleadores de una liga (football-data, 1 h de caché). */
export async function getScorers(code) {
  if (isEspnLeague(code)) return []; // ESPN no expone goleadores en la API pública
  try {
    const d = await fd(`/competitions/${code}/scorers?limit=15`, { revalidate: 3600 });
    return (d.scorers ?? []).map((x) => ({
      player: x.player.name, nationality: x.player.nationality, team: team(x.team),
      goals: x.goals ?? 0, assists: x.assists ?? 0, penalties: x.penalties ?? 0, played: x.playedMatches ?? null,
    }));
  } catch { return []; }
}

const POSITION_GROUPS = ['Porteros', 'Defensas', 'Mediocampistas', 'Delanteros', 'Otros'];
const positionGroup = (p = '') => (/goal/i.test(p) ? 'Porteros' : /back|defen/i.test(p) ? 'Defensas'
  : /midfield/i.test(p) ? 'Mediocampistas' : /offen|forward|wing|striker/i.test(p) ? 'Delanteros' : 'Otros');
const POSITION_ES = { Goalkeeper: 'Portero', Defence: 'Defensa', Midfield: 'Mediocampista', Offence: 'Delantero',
  'Centre-Back': 'Central', 'Left-Back': 'Lateral izq.', 'Right-Back': 'Lateral der.', 'Defensive Midfield': 'Pivote',
  'Central Midfield': 'Mediocentro', 'Attacking Midfield': 'Mediapunta', 'Left Winger': 'Extremo izq.',
  'Right Winger': 'Extremo der.', 'Centre-Forward': 'Delantero centro', 'Left Midfield': 'Volante izq.', 'Right Midfield': 'Volante der.' };
const age = (dob) => (dob ? Math.floor((Date.now() - Date.parse(dob)) / (365.25 * DAY)) : null);
const AF_GROUP = { Goalkeeper: 'Porteros', Defender: 'Defensas', Midfielder: 'Mediocampistas', Attacker: 'Delanteros' };
const AF_POSITION = { Goalkeeper: 'Portero', Defender: 'Defensa', Midfielder: 'Mediocampista', Attacker: 'Delantero' };
const lastToken = (n) => tokens(n).at(-1) ?? n.toLowerCase();

/** Plantilla de API-Football (con fotos y dorsales) para un equipo de football-data. null si no se encuentra o no hay cuota. */
async function afSquadFor(info) {
  const results = await searchTeams(searchTerm(info.name));
  const match = results && bestTeamMatch(info.name, results.map((r) => ({ id: r.team.id, name: r.team.name, country: r.team.country })), info.area?.name);
  if (!match) return null;
  const players = (await afSquad(match.id))?.[0]?.players;
  if (!players?.length) return null;
  const fdByLast = new Map((info.squad ?? []).map((p) => [lastToken(p.name), p]));
  return players.map((p) => {
    const fdP = fdByLast.get(lastToken(p.name));
    return {
      id: p.id, playerId: p.id, name: fdP?.name ?? p.name, number: p.number ?? null, age: p.age ?? age(fdP?.dateOfBirth),
      position: AF_POSITION[p.position] ?? p.position, group: AF_GROUP[p.position] ?? 'Otros', nationality: fdP?.nationality ?? null, photo: p.photo ?? playerPhoto(p.id),
    };
  });
}

/** Arma la página de equipo con los datos de cualquier proveedor. */
function buildTeamPage({ team: t, league, matches, players, groups, id }) {
  const rows = groups.find((g) => g.rows.some((r) => r.team.id === id))?.rows ?? [];
  const idx = rows.findIndex((r) => r.team.id === id);
  const results = matches.filter((m) => m.status === 'finished').sort((a, b) => b.utc - a.utc);
  const form = results.slice(0, 5).map((m) => {
    const [h, a] = m.score; const mine = m.home.id === id ? h - a : a - h;
    return mine > 0 ? 'G' : mine === 0 ? 'E' : 'P';
  }).join('');
  return {
    team: t,
    league,
    position: idx >= 0 ? idx + 1 : null,
    standing: idx >= 0 ? rows[idx] : null,
    form,
    standings: rows,
    live: matches.filter((m) => m.status === 'live'),
    upcoming: matches.filter((m) => m.status === 'scheduled').sort((a, b) => a.utc - b.utc),
    results,
    squad: POSITION_GROUPS.map((group) => ({ group, players: players.filter((p) => p.group === group) })).filter((g) => g.players.length),
  };
}

/** Equipo de una liga de ESPN (id "col.1-5264"). */
async function espnTeamPage({ slug, id }) {
  const lg = LEAGUES.find((l) => l.espn === slug);
  if (!lg) return null;
  const [bundle, { groups }] = await Promise.all([espn.teamBundle(slug, id, lg), espn.standings(slug)]);
  if (!bundle) return null;
  return buildTeamPage({
    team: bundle.team, matches: bundle.matches, players: bundle.players, groups, id: bundle.team.id,
    league: { id: lg.code, name: lg.name, inApp: true },
  });
}

/** Página de equipo: ficha, plantilla, próximos partidos, resultados, forma y tabla de su liga. */
export async function getTeamPage(teamId) {
  const eid = espn.parseEspnId(teamId);
  if (eid) return espnTeamPage(eid);
  const id = Number(teamId);
  if (!Number.isInteger(id) || id <= 0) return null;
  let info;
  try { info = await fd(`/teams/${id}`, { revalidate: 86400 }); }
  catch (e) { if (/ (400|403|404) /.test(e.message)) return null; throw e; }

  const running = info.runningCompetitions ?? [];
  const leagueComp = running.find((c) => c.type === 'LEAGUE' && FD_CODES.includes(c.code)) ?? running.find((c) => c.type === 'LEAGUE');
  const from = dayKey(Date.now() - 45 * DAY), to = dayKey(Date.now() + 45 * DAY);
  const [{ groups }, data, afPlayers] = await Promise.all([
    leagueComp ? standingsOf(leagueComp.code) : { groups: [] },
    fd(`/teams/${id}/matches?dateFrom=${from}&dateTo=${to}`, { revalidate: 600 }).catch(() => ({ matches: [] })),
    afSquadFor(info).catch(() => null),
  ]);
  const matches = (data.matches ?? []).map(toMatch);

  // Con API-Football: fotos, dorsales y enlace al perfil. Sin ella (o sin cuota): la plantilla de football-data.
  const players = afPlayers ?? (info.squad ?? []).map((p) => ({
    id: p.id, playerId: null, name: p.name, position: POSITION_ES[p.position] ?? p.position ?? '', group: positionGroup(p.position),
    nationality: p.nationality, age: age(p.dateOfBirth), number: p.shirtNumber ?? null, photo: null,
  }));
  return buildTeamPage({
    team: { ...team(info), founded: info.founded, venue: info.venue, colors: info.clubColors, website: info.website, coach: info.coach?.name ?? null },
    league: leagueComp ? { id: leagueComp.code, name: leagueName(leagueComp.code, leagueComp.name), inApp: CODES.includes(leagueComp.code) } : null,
    matches, players, groups, id,
  });
}

const POSITION_PROFILE = { Goalkeeper: 'Portero', Defender: 'Defensa', Midfielder: 'Mediocampista', Attacker: 'Delantero' };

/** Perfil de un jugador (id de API-Football). Las estadísticas de temporada no están en el plan gratis. */
export async function getPlayer(playerId) {
  const id = Number(playerId);
  if (!Number.isInteger(id) || id <= 0) return null;
  const p = (await playerProfile(id))?.[0]?.player;
  if (!p) return null;
  return {
    id: p.id, name: p.name, fullName: [p.firstname, p.lastname].filter(Boolean).join(' '), number: p.number ?? null,
    position: POSITION_PROFILE[p.position] ?? p.position, age: p.age, birthDate: p.birth?.date ?? null,
    birthPlace: [p.birth?.place, p.birth?.country].filter(Boolean).join(', '), nationality: p.nationality,
    height: p.height ? `${p.height} cm` : null, weight: p.weight ? `${p.weight} kg` : null, photo: p.photo ?? playerPhoto(p.id),
  };
}

// ---------- noticias ----------

/** Noticias de ESPN en español. code: una liga, o todas si se omite. */
export async function getNews(code) {
  const leagues = code ? LEAGUES.filter((l) => l.code === code) : LEAGUES;
  const lists = await Promise.all(leagues.map((l) => espn.news(l.espn, l, code ? 20 : 6)));
  const seen = new Set();
  return lists.flat()
    .filter((a) => !seen.has(a.headline) && seen.add(a.headline))
    .sort((a, b) => Date.parse(b.published ?? 0) - Date.parse(a.published ?? 0));
}

/** Noticias que mencionan a un equipo (de las noticias de su liga). */
export async function getTeamNews(teamName, leagueCode) {
  const lg = leagueByCode(leagueCode);
  if (!lg?.espn) return [];
  const all = await espn.news(lg.espn, lg, 30);
  const want = tokens(teamName);
  return all.filter((n) => tokens(`${n.headline} ${n.description}`).some((t) => want.includes(t))).slice(0, 8);
}

// ---------- buscador ----------

/** Índice de ligas y equipos (de las tablas de todas las ligas + partidos de la semana). 6 h de caché. */
export const getSearchIndex = unstable_cache(async () => {
  const [groupsByLeague, week] = await Promise.all([
    Promise.all(LEAGUES.map((l) => standingsOf(l.code).then((r) => [l, r.groups]).catch(() => [l, []]))),
    windowMatches().catch(() => []),
  ]);
  const teams = new Map();
  const add = (t, l) => { if (t?.id != null && !teams.has(String(t.id))) teams.set(String(t.id), { id: t.id, name: t.name, crest: t.crest, league: l?.name ?? '' }); };
  for (const [l, groups] of groupsByLeague) for (const g of groups) for (const r of g.rows) add(r.team, l);
  for (const m of week) { const l = leagueByCode(m.leagueId); add(m.home, l); add(m.away, l); }
  // Selección rápida: los 10 primeros de cada liga (con varios grupos, se ordenan juntos por puntos y diferencia de gol).
  const top = groupsByLeague.map(([l, groups]) => {
    const rows = groups.length > 1
      ? groups.flatMap((g) => g.rows).sort((a, b) => b.pts - a.pts || b.gd - a.gd)
      : groups[0]?.rows ?? [];
    const pick = rows.length
      ? rows.slice(0, 10).map((r) => r.team)
      : week.filter((m) => m.leagueId === l.code).flatMap((m) => [m.home, m.away]).filter((t, i, a) => a.findIndex((x) => x.id === t.id) === i).slice(0, 10);
    return { code: l.code, name: l.name, emblem: leagueEmblem(l.code), teams: pick.map((t) => ({ id: t.id, name: t.name, crest: t.crest })) };
  }).filter((g) => g.teams.length);
  return {
    leagues: LEAGUES.map((l) => ({ code: l.code, name: l.name, country: l.country, emblem: leagueEmblem(l.code) })),
    teams: [...teams.values()],
    top,
  };
}, ['search-index-v2'], { revalidate: 21600 });
