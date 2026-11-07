// Capa de datos. Hoy lee mocks; cuando haya API, reemplaza el cuerpo de cada función por fetch (mismo formato de salida).
import { MATCHES, HIGHLIGHTS, LEAGUES, STANDINGS } from '@/lib/mocks/matches';

const groupByLeague = (list) => {
  const groups = {};
  for (const m of list) (groups[m.leagueId] ??= { leagueId: m.leagueId, league: m.league, matches: [] }).matches.push(m);
  return Object.values(groups);
};
const plays = (code) => (m) => m.home.code === code || m.away.code === code;

export async function getFeaturedMatch() {
  return MATCHES.find((m) => m.featured) ?? MATCHES[0];
}
export async function getMatch(id) {
  return MATCHES.find((m) => m.id === id) ?? null;
}
export async function getLiveCount() {
  return MATCHES.filter((m) => m.status === 'live').length;
}
export async function getTodayByLeague() {
  return groupByLeague(MATCHES.filter((m) => m.status !== 'finished'));
}
export async function getHighlights() {
  return HIGHLIGHTS;
}

/** { live: [...grupos], scheduled: [...], finished: [...] } */
export async function getMatchesByStatus() {
  const by = (s) => groupByLeague(MATCHES.filter((m) => m.status === s));
  return { live: by('live'), scheduled: by('scheduled'), finished: by('finished') };
}

export async function getLeagues() {
  return LEAGUES.map((l) => {
    const ms = MATCHES.filter((m) => m.leagueId === l.id);
    return { ...l, live: ms.filter((m) => m.status === 'live').length, total: ms.length };
  });
}
export async function getLeague(id) {
  const league = LEAGUES.find((l) => l.id === id);
  if (!league) return null;
  return { ...league, standings: STANDINGS[id] ?? [], matches: MATCHES.filter((m) => m.leagueId === id) };
}

/** Resumen de un equipo: su liga, posición, tabla y partidos. */
export async function getTeamOverview(code) {
  for (const [leagueId, table] of Object.entries(STANDINGS)) {
    const idx = table.findIndex((r) => r.team.code === code);
    if (idx === -1) continue;
    return {
      team: table[idx].team,
      league: LEAGUES.find((l) => l.id === leagueId),
      position: idx + 1,
      standing: table[idx],
      standings: table,
      matches: MATCHES.filter(plays(code)),
    };
  }
  return null;
}
