// Empareja el mismo equipo entre proveedores ("Borussia Dortmund" vs "Dortmund", "FC Bayern München" vs "Bayern Munich").

const GENERIC = new Set([
  'fc', 'cf', 'afc', 'sc', 'ac', 'as', 'ss', 'sv', 'vfb', 'vfl', 'tsg', 'fsv', 'rc', 'cd', 'ud', 'sd', 'rcd', 'ca', 'se', 'ec',
  'club', 'de', 'del', 'la', 'el', 'the', 'and', 'calcio', 'football', 'futbol', 'clube', 'sporting', 'real', 'united', 'city',
]);

export function tokens(name = '') {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
    .toLowerCase()
    .replace(/ü/g, 'u').replace(/münchen|munchen/g, 'munich')
    .split(/[^a-z]+/)
    .filter((t) => t.length > 2 && !GENERIC.has(t));
}

const YOUTH = /\b(u\d{2}|ii|iii|w|b|women|femenino|reserves?)\b/i;

/**
 * Elige entre candidatos [{ id, name, country }] el que mejor corresponde a `name`.
 * Puntaje: palabras en común menos media por cada palabra de más ("Atletico Madrid" pierde ante "Real Madrid").
 * Descarta juveniles, filiales y femeninos; si se da `country`, exige que coincida.
 */
export function bestTeamMatch(name, candidates, country) {
  const want = tokens(name);
  let best = null, bestScore = 0;
  for (const c of candidates) {
    if (YOUTH.test(c.name) || (country && c.country && c.country !== country)) continue;
    const got = tokens(c.name);
    const shared = got.filter((t) => want.includes(t)).length;
    const score = shared - 0.5 * (got.length - shared);
    if (shared && score > bestScore) { best = c; bestScore = score; }
  }
  return best;
}

/** Palabra más distintiva del nombre, para buscar en otra API ("Real Madrid CF" → "madrid"). */
export const searchTerm = (name) => [...tokens(name)].sort((a, b) => b.length - a.length)[0] ?? name;

/** true si comparten al menos una palabra significativa (o, sin palabras útiles, si el nombre normalizado coincide). */
export function sameTeam(a, b) {
  const ta = tokens(a), tb = tokens(b);
  if (!ta.length || !tb.length) return a.toLowerCase().trim() === b.toLowerCase().trim();
  return ta.some((t) => tb.includes(t));
}
