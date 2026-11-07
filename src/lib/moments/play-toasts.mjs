// Jugadas del relato que se avisan con un toast (los goles, tarjetas y VAR ya tienen animación).
// kind = tipo de jugada de ESPN. Lógica pura: se prueba en play-toasts.test.mjs.
export const PLAY_TOASTS = {
  foul: { icon: '🦵', title: 'Falta' },
  offside: { icon: '🚩', title: 'Fuera de lugar' },
  'corner-awarded': { icon: '⛳', title: 'Tiro de esquina' },
  'shot-on-target': { icon: '🧤', title: 'Tiro a puerta' },
  'shot-hit-woodwork': { icon: '🥅', title: '¡Al palo!', tone: 'warn' },
  handball: { icon: '✋', title: 'Mano' },
  'penalty---scored': null, // el gol ya se anima
  'penalty---saved': { icon: '🧤', title: '¡Penal atajado!', tone: 'warn' },
  'penalty---missed': { icon: '❌', title: 'Penal fallado', tone: 'warn' },
  substitution: { icon: '🔁', title: 'Cambio' },
  'start-delay': { icon: '⏸️', title: 'Juego detenido' },
};

function config(kind) {
  if (!kind) return null;
  if (kind in PLAY_TOASTS) return PLAY_TOASTS[kind];
  if (/penalty/.test(kind) && !/scored/.test(kind)) return { icon: '⚠️', title: 'Penal', tone: 'warn' };
  return null;
}

/** Una jugada del relato → { id, icon, title, text, min, tone } o null si no se avisa. */
export function playToToast(play) {
  const c = config(play?.kind);
  if (!c) return null;
  const title = play.team ? `${c.title} · ${play.team}` : c.title;
  return { id: `play-${play.id}`, icon: c.icon, title, text: play.text, min: play.min, tone: c.tone ?? 'default', duration: 5000 };
}

/**
 * Jugadas nuevas para avisar: las que no estaban en `seen` (Set de ids). commentary viene del más reciente al más antiguo.
 * Devuelve { toasts (en orden cronológico, máx. `max`), seen (actualizado) }.
 */
export function newPlayToasts(commentary = [], seen, max = 3) {
  const next = new Set(seen);
  const fresh = [];
  for (const p of [...commentary].reverse()) {
    if (!p?.id || next.has(p.id)) continue;
    next.add(p.id);
    const t = playToToast(p);
    if (t) fresh.push(t);
  }
  return { toasts: fresh.slice(-max), seen: next };
}
