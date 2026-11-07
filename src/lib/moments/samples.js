// Datos de ejemplo de cada animación (equipos ficticios), para el banco de pruebas /prueba.
export const MOMENT_LABELS = {
  goal: 'Gol', lastMinuteGoal: 'Gol último minuto', yellow: 'Amarilla', red: 'Roja',
  secondYellow: 'Doble amarilla', var: 'VAR', fullTime: 'Final',
};

export const MOMENT_SAMPLES = {
  goal: { team: 'Atlético Norte', scorer: 'M. Ríos', assist: 'J. Ortega', minute: "64'", home: 'ATN', away: 'RCO', score: [2, 1], prevScore: [1, 1], side: 'home' },
  lastMinuteGoal: { team: 'Atlético Norte', scorer: 'L. Gómez', minute: "90+3'", home: 'ATN', away: 'RCO', score: [3, 2], prevScore: [2, 2], side: 'home', headline: '¡Lo gana en el descuento!' },
  yellow: { player: 'J. Pérez', number: 6, team: 'Real Costa', minute: "58'", reason: 'Falta táctica' },
  red: { player: 'D. Sosa', number: 9, team: 'Real Costa', minute: "72'", note: 'Expulsado, juega con 10' },
  secondYellow: { player: 'J. Pérez', number: 6, team: 'Real Costa', minute: "81'", note: 'Juega con 10' },
  var: { reason: 'Posible penal', decision: 'Penal confirmado', outcome: 'confirmed', minute: "77'" },
  fullTime: { home: 'Atlético Norte', away: 'Real Costa', score: [3, 2], note: 'El Norte se pone líder con 32 puntos' },
};
