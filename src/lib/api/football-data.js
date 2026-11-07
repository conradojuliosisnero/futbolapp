import 'server-only';

// Cliente de football-data.org (fuente principal). Plan gratis: 10 consultas por minuto.
// La caché de Next (revalidate) hace que muchos usuarios compartan la misma consulta.
const BASE = 'https://api.football-data.org/v4';
const MAX_WAIT_S = 12;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fd(path, { revalidate = 60 } = {}, attempt = 0) {
  const key = process.env.API_DATA_API_KEY;
  if (!key) throw new Error('Falta API_DATA_API_KEY (football-data.org) en .env');

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { [process.env.API_DATA_API_HEADER || 'X-Auth-Token']: key },
      next: { revalidate },
    });
  } catch (e) {
    // Falla de red pasajera: un reintento corto.
    if (attempt < 1) { await sleep(1500); return fd(path, { revalidate }, attempt + 1); }
    throw e;
  }

  // Límite por minuto alcanzado: la API dice cuántos segundos esperar. Si es poco, esperamos y reintentamos (máx. 2 veces).
  if (res.status === 429 && attempt < 2) {
    const body = await res.json().catch(() => ({}));
    const wait = Number(res.headers.get('x-requestcounter-reset')) || Number(/Wait (\d+)/.exec(body.message ?? '')?.[1]) || MAX_WAIT_S;
    if (wait <= MAX_WAIT_S) {
      await sleep((wait + 1) * 1000);
      return fd(path, { revalidate }, attempt + 1);
    }
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`football-data ${res.status} en ${path}: ${body.message ?? res.statusText}`);
  }
  const json = await res.json();
  // Hora real de la consulta (la caché de Next guarda la respuesta con su cabecera Date).
  Object.defineProperty(json, 'fetchedAt', { value: Date.parse(res.headers.get('date') ?? '') || Date.now() });
  return json;
}
