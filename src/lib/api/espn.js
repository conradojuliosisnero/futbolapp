import 'server-only';
import { sameTeam } from './team-match.mjs';
import { DAY, dayKey, time, dayLabel } from './dates';
import { placeStarters } from './espn-lineup.mjs';

// Cliente de ESPN (API pública NO oficial, sin clave). Puede cambiar o cerrarse sin aviso: todo lo que viene de aquí
// es opcional y, si falla, devuelve null/[] para que la app siga con football-data y API-Football.
// No publica límites; igual todo pasa por la caché compartida de Next para no saturarla.
const SITE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const V2 = 'https://site.api.espn.com/apis/v2/sports/soccer';

async function espn(url, revalidate) {
  try {
    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}lang=es&region=co`, { next: { revalidate } });
    if (!res.ok) { console.warn('ESPN', res.status, url); return null; }
    const json = await res.json();
    // Cuándo respondió ESPN de verdad (la caché guarda el header Date): el reloj en vivo avanza desde ahí.
    const at = Date.parse(res.headers.get('date') ?? '') || Date.now();
    if (Array.isArray(json?.events)) json.events.forEach((e) => { e.__at = at; });
    if (json?.header) json.header.__at = at;
    return json;
  } catch (e) {
    console.warn('ESPN no respondió:', e.message);
    return null;
  }
}

// ---------- ids ----------
// Los ids de ESPN pueden coincidir con los de football-data, así que llevan la liga: "col.1-401877771".
export const espnId = (slug, id) => `${slug}-${id}`;
export function parseEspnId(value) {
  const s = String(value);
  const i = s.lastIndexOf('-');
  if (i < 1) return null;
  const slug = s.slice(0, i), id = s.slice(i + 1);
  return /^[a-z]+(\.[a-z0-9]+)+$/i.test(slug) && /^\d+$/.test(id) ? { slug, id } : null;
}

// ---------- normalización ----------
const team = (t, slug) => ({
  id: espnId(slug, t.id),
  code: t.abbreviation ?? (t.shortDisplayName || t.displayName || '?').slice(0, 3).toUpperCase(),
  name: t.shortDisplayName || t.displayName || t.name,
  crest: t.logo ?? t.logos?.[0]?.href ?? null,
});
const scoreOf = (c) => Number(typeof c.score === 'object' ? c.score?.displayValue ?? c.score?.value : c.score) || 0;

/** Evento de ESPN (scoreboard, calendario o resumen) → partido de la app. */
export function toMatch(ev, slug, league) {
  const comp = ev.competitions?.[0] ?? ev;
  const st = comp.status ?? ev.status;
  const home = comp.competitors.find((c) => c.homeAway === 'home');
  const away = comp.competitors.find((c) => c.homeAway === 'away');
  const type = st?.type ?? {};
  const status = type.state === 'in' ? 'live' : type.state === 'post' && type.completed ? 'finished' : 'scheduled';
  const date = Date.parse(ev.date ?? comp.date);
  const minute = status === 'live' ? (type.name === 'STATUS_HALFTIME' ? 'MT' : st.displayClock || 'EN VIVO') : null;
  // Para que el minuto avance solo en pantalla entre actualizaciones (ver live-clock.mjs).
  const liveClock = minute && minute !== 'MT' && ev.__at ? { minute, seconds: st.clock ?? null, period: st.period ?? null, at: ev.__at } : null;
  const other = { STATUS_POSTPONED: 'Aplaz.', STATUS_CANCELED: 'Canc.', STATUS_SUSPENDED: 'Susp.' }[type.name];
  return {
    id: espnId(slug, ev.id),
    espn: { slug, id: String(ev.id) },
    utc: date,
    leagueId: league.code,
    league: league.name,
    round: '',
    status,
    minute,
    clock: minute,
    liveClock,
    progress: minute ? Math.min(1, (parseInt(minute, 10) || 45) / 90) : 0,
    kickoff: time(date),
    day: dayLabel(date),
    label: minute ?? (status === 'finished' ? 'Final' : other ?? time(date)),
    home: team(home.team, slug),
    away: team(away.team, slug),
    score: status === 'scheduled' ? undefined : [scoreOf(home), scoreOf(away)],
  };
}

// ---------- partidos ----------
const ymd = (date) => dayKey(date).replace(/-/g, '');

/** Partidos de un día. Hoy se refresca cada 15 s (marcador y minuto en vivo); días pasados 1 h; futuros 30 min. */
export async function scoreboard(slug, date = Date.now()) {
  const today = dayKey(Date.now()), k = dayKey(date);
  const revalidate = k === today ? 15 : k < today ? 3600 : 1800;
  return (await espn(`${SITE}/${slug}/scoreboard?dates=${ymd(date)}`, revalidate))?.events ?? [];
}

/** Partidos de una liga entre hace 3 días y dentro de 6 (ESPN no acepta rangos: un día por consulta). */
export async function leagueWindow(league) {
  const days = Array.from({ length: 10 }, (_, i) => Date.now() + (i - 3) * DAY);
  const lists = await Promise.all(days.map((d) => scoreboard(league.espn, d)));
  const seen = new Set();
  return lists.flat().filter((ev) => !seen.has(ev.id) && seen.add(ev.id)).map((ev) => toMatch(ev, league.espn, league));
}

/** El mismo partido en ESPN (para minuto real y detalle de partidos de football-data). */
export async function findEvent(slug, match) {
  for (const date of [match.utc, match.utc - DAY]) {
    const ev = (await scoreboard(slug, date)).find((e) => {
      const cs = e.competitions[0].competitors;
      const h = cs.find((c) => c.homeAway === 'home')?.team, a = cs.find((c) => c.homeAway === 'away')?.team;
      return h && a && sameTeam(h.displayName, match.home.name) && sameTeam(a.displayName, match.away.name);
    });
    if (ev) return ev;
  }
  return null;
}

// ---------- detalle de partido ----------
const STATS = [
  ['possessionPct', 'Posesión %'], ['totalShots', 'Tiros'], ['shotsOnTarget', 'Tiros a puerta'], ['wonCorners', 'Córners'],
  ['foulsCommitted', 'Faltas'], ['offsides', 'Fueras de juego'], ['yellowCards', 'Amarillas'], ['redCards', 'Rojas'],
  ['saves', 'Atajadas'], ['totalPasses', 'Pases'], ['passPct', 'Precisión de pase %'],
];
const INFO_EVENTS = new Set(['kickoff', 'halftime', 'start-2nd-half', 'end-regular-time', 'full-time', 'start-extra-time', 'end-extra-time']);

function toLineup(side) {
  const player = (p, grid) => ({ id: null, number: p.jersey ? Number(p.jersey) : null, name: p.athlete?.displayName ?? '', pos: p.position?.abbreviation ?? '', grid, photo: p.athlete?.headshot?.href ?? null });
  return {
    formation: side.formation ?? '',
    coach: null,
    startXI: placeStarters(side.roster.filter((p) => p.starter), side.formation ?? '').map(({ p, grid }) => player(p, grid)),
    subs: side.roster.filter((p) => !p.starter).map((p) => player(p, null)),
  };
}

/** Eventos, relato, estadísticas y alineaciones de un partido de ESPN. */
export async function matchDetails(slug, eventId, status) {
  const revalidate = status === 'live' ? 15 : status === 'finished' ? 3600 : 600;
  const sum = await espn(`${SITE}/${slug}/summary?event=${eventId}`, revalidate);
  if (!sum) return null;
  const comp = sum.header?.competitions?.[0];
  const homeId = comp?.competitors?.find((c) => c.homeAway === 'home')?.team?.id;
  const sideOf = (teamId) => (String(teamId) === String(homeId) ? 'home' : 'away');

  const events = (sum.keyEvents ?? []).flatMap((e) => {
    const t = e.type?.type ?? '', min = e.clock?.displayValue ?? '';
    const names = (e.participants ?? []).map((p) => p.athlete?.displayName).filter(Boolean);
    const side = e.team ? sideOf(e.team.id) : null;
    const teamName = e.team?.displayName ?? '';
    if (t.startsWith('goal') || e.scoringPlay) {
      const own = /own/i.test(t), pen = /penalty/i.test(t);
      return [{ min, side, player: names[0], type: 'goal', title: `¡GOL! ${teamName}`, text: `${names[0] ?? ''}${pen ? ' (penal)' : own ? ' (autogol)' : ''}${names[1] ? ` · asistencia de ${names[1]}` : ''}` }];
    }
    if (t === 'yellow-card') return [{ min, side, player: names[0], type: 'yellow', title: `Amarilla · ${names[0] ?? ''} (${teamName})` }];
    if (t === 'red-card' || t === 'yellow-red-card') return [{ min, side, player: names[0], type: 'red', title: `Roja · ${names[0] ?? ''} (${teamName})` }];
    if (t === 'substitution') return [{ min, side, type: 'sub', title: `Cambio · ${teamName}`, text: names.length >= 2 ? `Entra ${names[0]} · sale ${names[1]}` : e.text }];
    if (INFO_EVENTS.has(t)) return [{ min, side: null, type: 'info', title: e.type?.text ?? '' }];
    if (/var|penalty/i.test(t)) return [{ min, side, type: 'var', title: e.type?.text ?? 'VAR', text: e.text }];
    return [];
  }).reverse();

  // kind: tipo de jugada de ESPN (foul, offside, corner-awarded, shot-on-target, substitution…): lo usan los avisos del relato.
  const commentary = (sum.commentary ?? []).filter((c) => c.text).map((c) => ({
    id: c.play?.id ?? `${c.sequence}`, min: c.time?.displayValue ?? '', text: c.text,
    kind: c.play?.type?.type ?? null, team: c.play?.team?.displayName ?? null,
  })).reverse();

  const box = sum.boxscore?.teams ?? [];
  const h = box.find((t) => t.homeAway === 'home'), a = box.find((t) => t.homeAway === 'away');
  const val = (t, name) => {
    const v = parseFloat(t?.statistics?.find((s) => s.name === name)?.displayValue);
    return Number.isFinite(v) ? (name === 'passPct' && v <= 1 ? Math.round(v * 100) : v) : null;
  };
  const stats = h && a ? STATS.filter(([n]) => val(h, n) != null || val(a, n) != null).map(([n, label]) => ({ label, home: val(h, n) ?? 0, away: val(a, n) ?? 0 })) : [];

  const rh = sum.rosters?.find((r) => r.homeAway === 'home'), ra = sum.rosters?.find((r) => r.homeAway === 'away');
  const lineups = rh?.roster?.some((p) => p.starter) && ra?.roster?.some((p) => p.starter) ? { home: toLineup(rh), away: toLineup(ra) } : null;

  const goals = (side) => events.filter((e) => e.type === 'goal' && e.side === side).map((e) => `${e.player ?? ''} ${e.min}`).reverse();
  return {
    header: comp ? { id: sum.header.id, date: comp.date, competitions: [comp], __at: sum.header.__at } : null,
    events,
    commentary,
    stats,
    lineups,
    scorers: events.some((e) => e.type === 'goal') ? { home: goals('home'), away: goals('away') } : undefined,
  };
}

// ---------- tablas, equipos y plantillas ----------

export async function standings(slug) {
  const d = await espn(`${V2}/${slug}/standings`, 3600);
  const groups = (d?.children ?? []).map((g) => ({
    name: (d.children.length > 1 ? g.name : null) ?? null,
    rows: (g.standings?.entries ?? []).map((e) => {
      const s = (n) => Number(e.stats.find((x) => x.name === n)?.value ?? 0);
      return { team: team(e.team, slug), played: s('gamesPlayed'), won: s('wins'), drawn: s('ties'), lost: s('losses'), gd: s('pointDifferential'), pts: s('points'), form: null };
    }),
  }));
  return { groups, season: d?.seasons?.[0] ?? null };
}

const GROUP = { Goalkeeper: 'Porteros', Defender: 'Defensas', Midfielder: 'Mediocampistas', Forward: 'Delanteros' };
const POSITION = { Goalkeeper: 'Portero', Defender: 'Defensa', Midfielder: 'Mediocampista', Forward: 'Delantero' };

/** Ficha, plantilla y calendario de un equipo de ESPN. */
export async function teamBundle(slug, id, league) {
  const [info, roster, past, next] = await Promise.all([
    espn(`${SITE}/${slug}/teams/${id}`, 86400),
    espn(`${SITE}/${slug}/teams/${id}/roster`, 86400),
    espn(`${SITE}/${slug}/teams/${id}/schedule`, 600),
    espn(`${SITE}/${slug}/teams/${id}/schedule?fixture=true`, 600),
  ]);
  const t = info?.team;
  if (!t) return null;
  const seen = new Set();
  const matches = [...(past?.events ?? []), ...(next?.events ?? [])]
    .filter((ev) => !seen.has(ev.id) && seen.add(ev.id))
    .map((ev) => toMatch(ev, slug, league));
  const players = (roster?.athletes ?? []).map((p) => ({
    id: p.id, playerId: null, name: p.displayName, number: p.jersey ? Number(p.jersey) : null, age: p.age ?? null,
    position: POSITION[p.position?.name] ?? p.position?.name ?? '', group: GROUP[p.position?.name] ?? 'Otros',
    nationality: p.citizenship ?? null, photo: p.headshot?.href ?? null,
  }));
  return {
    team: { ...team(t, slug), founded: null, venue: t.venue?.fullName ?? null, colors: null, website: null, coach: null, record: t.record?.items?.[0]?.summary ?? null },
    matches,
    players,
  };
}

// ---------- noticias ----------

/** Últimas noticias de una liga (en español, con imagen). */
export async function news(slug, league, limit = 12) {
  const d = await espn(`${SITE}/${slug}/news?limit=${limit}`, 900);
  return (d?.articles ?? []).filter((a) => a.headline && a.links?.web?.href).map((a) => ({
    id: `${slug}-${a.id ?? a.headline}`,
    headline: a.headline,
    description: a.description ?? '',
    published: a.published ?? a.lastModified ?? null,
    image: a.images?.[0]?.url ?? null,
    url: a.links.web.href,
    league: league.name,
    leagueCode: league.code,
  }));
}
