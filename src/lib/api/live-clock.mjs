// Minuto en vivo que avanza solo entre actualizaciones (lógica pura, probada en live-clock.test.mjs).
// ESPN da el minuto como texto ("40'", "45'+2'") y `clock` en segundos (en la reposición se queda fijo).
// at = cuándo se consultó ESPN (ms). Se suma lo que pasó desde entonces, con tope para no inventar si los datos se atrasan.

const MAX_AHEAD_MIN = 5;

/** "45'+2'" → { base: 45, extra: 2 } · "MT" o vacío → null */
export function parseClock(text) {
  const m = String(text ?? '').match(/^(\d+)'?(?:\s*\+\s*(\d+)'?)?/);
  return m ? { base: Number(m[1]), extra: Number(m[2] ?? 0) } : null;
}

/**
 * Minuto a mostrar ahora. clock = { minute: "40'", seconds: 2340, period: 1, at: ms } (de toMatch).
 * Devuelve el texto ("41'", "45'+3'") o el minuto original si no se puede calcular (entretiempo, sin datos).
 */
export function liveMinute(clock, now = Date.now()) {
  const p = parseClock(clock?.minute);
  if (!p || !clock.at || !clock.period) return clock?.minute ?? null;
  // Segundos ya jugados dentro del minuto actual (solo en tiempo normal: en la reposición `seconds` no avanza).
  const inMinute = !p.extra && Number.isFinite(clock.seconds) ? clock.seconds % 60 : 0;
  const ahead = Math.min(MAX_AHEAD_MIN, Math.max(0, Math.floor((now - clock.at) / 60000 + inMinute / 60)));
  const total = p.base + p.extra + ahead;
  const end = clock.period === 1 ? 45 : clock.period === 2 ? 90 : clock.period === 3 ? 105 : 120;
  return total > end ? `${end}'+${total - end}'` : `${total}'`;
}
