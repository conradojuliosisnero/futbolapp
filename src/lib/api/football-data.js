import 'server-only';

// Cliente de football-data.org (fuente principal). Plan gratis: 10 consultas por minuto.
// La caché de Next (revalidate) hace que muchos usuarios compartan la misma consulta.
const BASE = 'https://api.football-data.org/v4';
const MAX_WAIT_S = 12;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fd(path, { revalidate = 60 } = {}, retried = false) {
  const key = process.env.API_DATA_API_KEY;
  if (!key) throw new Error('Falta API_DATA_API_KEY (football-data.org) en .env');

  const res = await fetch(`${BASE}${path}`, {
    headers: { [process.env.API_DATA_API_HEADER || 'X-Auth-Token']: key },
    next: { revalidate },
  });

  // Límite por minuto alcanzado: la API dice cuántos segundos esperar. Si es poco, esperamos y reintentamos una vez.
  if (res.status === 429 && !retried) {
    const body = await res.json().catch(() => ({}));
    const wait = Number(res.headers.get('x-requestcounter-reset')) || Number(/Wait (\d+)/.exec(body.message ?? '')?.[1]) || MAX_WAIT_S;
    if (wait <= MAX_WAIT_S) {
      await sleep((wait + 1) * 1000);
      return fd(path, { revalidate }, true);
    }
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`football-data ${res.status} en ${path}: ${body.message ?? res.statusText}`);
  }
  return res.json();
}
