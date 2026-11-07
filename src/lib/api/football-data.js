import 'server-only';

// Cliente de football-data.org (fuente principal). Plan gratis: 10 consultas por minuto.
// La caché de Next (revalidate) hace que muchos usuarios compartan la misma consulta.
const BASE = 'https://api.football-data.org/v4';

export async function fd(path, { revalidate = 60 } = {}) {
  const key = process.env.API_DATA_API_KEY;
  if (!key) throw new Error('Falta API_DATA_API_KEY (football-data.org) en .env');

  const res = await fetch(`${BASE}${path}`, {
    headers: { [process.env.API_DATA_API_HEADER || 'X-Auth-Token']: key },
    next: { revalidate },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`football-data ${res.status} en ${path}: ${body.message ?? res.statusText}`);
  }
  return res.json();
}
