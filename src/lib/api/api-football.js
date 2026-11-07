import 'server-only';
import { unstable_cache } from 'next/cache';

// Cliente de API-Football. Plan gratis: 100 consultas/día; bloquea consultas por temporada actual,
// pero sí deja: partidos en vivo, partidos por fecha y datos de UN partido (alineaciones, estadísticas, eventos).
//
// Presupuesto diario (todas con caché compartida entre usuarios):
//   live=all            15 min  → máx. ~96/día solo si hay partidos todo el día (en la práctica ~40)
//   partidos por fecha   6 h    → ~4/día por fecha consultada
//   alineaciones         6 h · estadísticas 30 min en vivo / 1 día terminado · eventos 1 día
// Si quedan menos de RESERVE consultas, se dejan de pedir los extras (alineaciones/estadísticas/eventos).
const RESERVE = 10;
let remaining = 100; // último valor que informó la API (best-effort, por proceso)

const host = () => (process.env.API_FOTBALL_API_HOST || 'https://v3.football.api-sports.io').replace(/\/$/, '');

async function af(path, { revalidate, essential = false } = {}) {
  const key = process.env.API_FOTBALL_API_KEY;
  if (!key || (!essential && remaining < RESERVE)) return null;
  try {
    const res = await fetch(`${host()}${path}`, {
      headers: { 'x-apisports-key': key },
      ...(revalidate === 0 ? { cache: 'no-store' } : { next: { revalidate } }),
    });
    const left = Number(res.headers.get('x-ratelimit-requests-remaining'));
    if (Number.isFinite(left)) remaining = left;
    const json = await res.json();
    if (!res.ok || (json.errors && Object.keys(json.errors).length)) {
      console.warn('API-Football', path, json.errors ?? res.status);
      return null;
    }
    return json.response ?? null;
  } catch (e) {
    console.warn('API-Football no respondió:', e.message);
    return null;
  }
}

/** Partidos en vivo con eventos (una consulta para todos). */
export async function liveFixtures() {
  return (await af('/fixtures?live=all', { revalidate: 900, essential: true })) ?? [];
}

/** Partidos de un día: solo id y nombres (la respuesta completa pesa demasiado para la caché de Next). */
export const fixturesOnDate = unstable_cache(
  async (date) => {
    const r = await af(`/fixtures?date=${date}`, { revalidate: 0 });
    if (!r) throw new Error('API-Football sin datos'); // los errores no se guardan en caché: se reintenta luego
    return r.map((f) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name }));
  },
  ['af-fixtures-on-date'],
  { revalidate: 21600 },
);

// Equipos y jugadores (no dependen de la temporada → sí funcionan en el plan gratis). Cambian poco: caché larga.
export const searchTeams = (term) => af(`/teams?search=${encodeURIComponent(term)}`, { revalidate: 2592000 }); // 30 días
export const squad = (teamId) => af(`/players/squads?team=${teamId}`, { revalidate: 604800 }); // 7 días
export const playerProfile = (playerId) => af(`/players/profiles?player=${playerId}`, { revalidate: 2592000 }); // 30 días

/** Foto pública del jugador (CDN de API-Football; no gasta consultas). */
export const playerPhoto = (playerId) => `https://media.api-sports.io/football/players/${playerId}.png`;

export const lineups = (fixtureId) => af(`/fixtures/lineups?fixture=${fixtureId}`, { revalidate: 21600 });
export const statistics = (fixtureId, live) => af(`/fixtures/statistics?fixture=${fixtureId}`, { revalidate: live ? 1800 : 86400 });
export const events = (fixtureId) => af(`/fixtures/events?fixture=${fixtureId}`, { revalidate: 86400 });
