const team = (code, name, crest = null) => ({ code, name, crest });

export const MATCHES = [
  {
    id: 'atn-rco', featured: true,
    league: 'Liga Nacional', round: 'Jornada 14',
    status: 'live', minute: "67'", clock: '67:12', progress: 0.74,
    home: team('ATN', 'Atlético Norte'), away: team('RCO', 'Real Costa'),
    score: [2, 1],
    scorers: { home: ["Ortega 22'", "Ríos 64'"], away: ["Sosa 38'"] },
    prediction: { home: 58, draw: 14, away: 28, votes: '12.4k' },
    events: [
      { min: "64'", type: 'goal', title: '¡GOL! Atlético Norte', text: 'M. Ríos remata de cabeza tras córner.', clip: true },
      { min: "58'", type: 'yellow', title: 'Amarilla · J. Pérez (RCO)' },
      { min: "51'", type: 'sub', title: 'Cambio · entra L. Gómez, sale A. Díaz' },
      { min: "38'", type: 'goal-against', title: 'Gol · Real Costa (D. Sosa)' },
      { min: "22'", type: 'goal-against', title: 'Gol · Atlético Norte (Ortega)' },
    ],
    stats: [
      { label: 'Posesión %', home: 61, away: 39 },
      { label: 'Tiros', home: 11, away: 6 },
      { label: 'Tiros a puerta', home: 5, away: 2 },
      { label: 'Córners', home: 6, away: 3 },
      { label: 'Faltas', home: 9, away: 12 },
    ],
    lineups: {
      home: ['Vera', 'Luna', 'Castro', 'Ibarra', 'Rojas', 'Ortega', 'Méndez', 'Díaz', 'Ríos', 'Navarro', 'Silva'],
      away: ['Paz', 'Pérez', 'Molina', 'Herrera', 'Campos', 'Sosa', 'Reyes', 'Cruz', 'Flores', 'Vargas', 'Ruiz'],
    },
  },
  { id: 'dep-uni', league: 'Liga Nacional', status: 'live', minute: "32'", home: team('DEP', 'Deportivo Sur'), away: team('UNI', 'Unión Valle'), score: [0, 0] },
  { id: 'rac-sie', league: 'Liga Nacional', status: 'scheduled', kickoff: '20:30', home: team('RAC', 'Racing Puerto'), away: team('SIE', 'Club Sierra') },
  { id: 'est-slu', league: 'Copa Regional', status: 'live', minute: "81'", home: team('EST', 'Estrella Roja'), away: team('SLU', 'San Lucas'), score: [1, 3] },
  { id: 'ula-atb', league: 'Copa Regional', status: 'scheduled', kickoff: '22:00', home: team('ULA', 'Unión Lago'), away: team('ATB', 'Atlético Bahía') },
];

export const HIGHLIGHTS = [
  { id: 'h1', title: "Gol de Ríos · 64'", duration: '0:48', thumb: null, href: '#' },
  { id: 'h2', title: 'Resumen: Sur 3–0 Puerto', duration: '5:12', thumb: null, href: '#' },
  { id: 'h3', title: 'Top 5 atajadas jornada 13', duration: '1:30', thumb: null, href: '#' },
];
