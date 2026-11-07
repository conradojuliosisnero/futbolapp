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

/** true si comparten al menos una palabra significativa (o, sin palabras útiles, si el nombre normalizado coincide). */
export function sameTeam(a, b) {
  const ta = tokens(a), tb = tokens(b);
  if (!ta.length || !tb.length) return a.toLowerCase().trim() === b.toLowerCase().trim();
  return ta.some((t) => tb.includes(t));
}
