import { getSearchIndex } from '@/lib/api/matches';

// Busca ligas y equipos en un índice cacheado (6 h). No consulta las APIs de fútbol por cada búsqueda.
const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  // ?top=1 → selección rápida: los 10 mejores equipos de cada liga.
  if (params.get('top')) {
    const { top } = await getSearchIndex();
    return Response.json({ top }, { headers: { 'Cache-Control': 'public, max-age=1800' } });
  }
  const q = norm(params.get('q') ?? '').trim().slice(0, 50);
  if (q.length < 2) return Response.json({ leagues: [], teams: [] });

  const { leagues, teams } = await getSearchIndex();
  const hit = (...fields) => fields.some((f) => norm(f).includes(q));
  // Primero los que empiezan con lo escrito ("real" → Real Madrid antes que Sociedad Real).
  const rank = (name) => (norm(name).startsWith(q) ? 0 : 1);

  return Response.json(
    {
      leagues: leagues.filter((l) => hit(l.name, l.country, l.code)).slice(0, 5),
      teams: teams.filter((t) => hit(t.name, t.league)).sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name)).slice(0, 10),
    },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}
