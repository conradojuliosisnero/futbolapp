import 'server-only';

// Cliente de API-Football (solo eventos en vivo). Plan gratis: 100 consultas al día y sin temporada actual,
// pero `fixtures?live=all` sí funciona y trae TODOS los partidos en vivo con sus eventos en una sola consulta.
// shortcut: caché de 15 min para no pasar de ~96 consultas/día; con plan pago bajar a 60 s.
const REVALIDATE = 900;

/** Partidos en vivo con eventos. Si la API falla o se acaba la cuota, devuelve [] (los eventos son opcionales). */
export async function liveFixtures() {
  const key = process.env.API_FOTBALL_API_KEY;
  const host = process.env.API_FOTBALL_API_HOST || 'https://v3.football.api-sports.io';
  if (!key) return [];
  try {
    const res = await fetch(`${host.replace(/\/$/, '')}/fixtures?live=all`, {
      headers: { 'x-apisports-key': key },
      next: { revalidate: REVALIDATE },
    });
    const json = await res.json();
    if (!res.ok || (json.errors && Object.keys(json.errors).length)) {
      console.warn('API-Football:', json.errors ?? res.status);
      return [];
    }
    return json.response ?? [];
  } catch (e) {
    console.warn('API-Football no respondió:', e.message);
    return [];
  }
}
