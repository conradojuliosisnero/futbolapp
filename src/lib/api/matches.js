// Capa de datos. Reemplaza el contenido por llamadas a tu API (fetch).
import { MATCHES, HIGHLIGHTS } from '@/lib/mocks/matches';

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
  const groups = {};
  for (const m of MATCHES) (groups[m.league] ??= []).push(m);
  return Object.entries(groups).map(([league, matches]) => ({ league, matches }));
}
export async function getHighlights() {
  return HIGHLIGHTS;
}
