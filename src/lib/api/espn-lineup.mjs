// Ubica a los titulares de ESPN en la cancha. ESPN da la formación ("4-2-3-1") y la posición de cada jugador
// ("Center Left Defender", "Attacking Midfielder Right"…), pero no su fila/columna: aquí se calculan.

/** Línea del campo: 0 arquero · 1 defensa · 1.5 carrilero · 2 volante de contención · 3 medio · 4 media punta · 5 extremo · 6 delantero.
 *  El carrilero ("Wing Back") queda entre defensa y medio: en 5-3-2 cae en la línea de 5 y en 3-5-2 en la de medios. */
export const depth = (n = '') => (/Goalkeeper/.test(n) ? 0 : /Wing Back/.test(n) ? 1.5 : /Back|Defender|Sweeper/.test(n) ? 1 : /Defensive Midfield/.test(n) ? 2
  : /Attacking Midfield/.test(n) ? 4 : /Midfield/.test(n) ? 3 : /Wing/.test(n) ? 5 : 6);

/** Lado, de izquierda a derecha: 0 izq · 1 centro-izq · 2 centro · 3 centro-der · 4 der. */
export const lateral = (n = '') => (/Center Left/.test(n) ? 1 : /Center Right/.test(n) ? 3 : /Left/.test(n) ? 0 : /Right/.test(n) ? 4 : 2);

const name = (p) => p.position?.name ?? '';
const place = (p) => Number(p.formationPlace) || 99;

/**
 * Devuelve los titulares con `grid` "fila:columna" (fila 1 = arquero), como usa la cancha de la app.
 * Se ordena por línea y se reparte según la formación; dentro de cada fila, de izquierda a derecha.
 */
export function placeStarters(starters, formation = '') {
  const counts = formation.split('-').map(Number).filter(Boolean);
  const gk = starters.filter((p) => depth(name(p)) === 0);
  const field = starters
    .filter((p) => depth(name(p)) !== 0)
    .sort((a, b) => depth(name(a)) - depth(name(b)) || place(a) - place(b));

  const rows = [];
  let i = 0;
  for (const n of counts.length ? counts : [field.length]) { rows.push(field.slice(i, i + n)); i += n; }
  if (i < field.length) rows.push(field.slice(i)); // por si la formación no cuadra con los datos

  return [
    ...gk.map((p) => ({ p, grid: '1:1' })),
    ...rows.flatMap((row, r) => [...row]
      .sort((a, b) => lateral(name(a)) - lateral(name(b)) || place(a) - place(b))
      .map((p, c) => ({ p, grid: `${r + 2}:${c + 1}` }))),
  ];
}
