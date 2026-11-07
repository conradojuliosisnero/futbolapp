// Datos de prueba hasta tener credenciales de la API de fútbol.
const team = (code, name, crest = null) => ({ code, name, crest });

const T = {
  ATN: team('ATN', 'Atlético Norte'), RCO: team('RCO', 'Real Costa'),
  DEP: team('DEP', 'Deportivo Sur'), UNI: team('UNI', 'Unión Valle'),
  RAC: team('RAC', 'Racing Puerto'), SIE: team('SIE', 'Club Sierra'),
  VAL: team('VAL', 'Valle Central'), MON: team('MON', 'Montaña FC'),
  EST: team('EST', 'Estrella Roja'), SLU: team('SLU', 'San Lucas'),
  ULA: team('ULA', 'Unión Lago'), ATB: team('ATB', 'Atlético Bahía'),
};

export const LEAGUES = [
  { id: 'liga-nacional', name: 'Liga Nacional', short: 'LN', season: '2026', round: 'Jornada 14' },
  { id: 'copa-regional', name: 'Copa Regional', short: 'CR', season: '2026', round: 'Cuartos de final' },
];

const LN = { leagueId: 'liga-nacional', league: 'Liga Nacional' };
const CR = { leagueId: 'copa-regional', league: 'Copa Regional' };

export const MATCHES = [
  {
    id: 'atn-rco', featured: true, ...LN, round: 'Jornada 14',
    status: 'live', minute: "67'", clock: '67:12', progress: 0.74,
    home: T.ATN, away: T.RCO,
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
  { id: 'dep-uni', ...LN, round: 'Jornada 14', status: 'live', minute: "32'", home: T.DEP, away: T.UNI, score: [0, 0] },
  { id: 'rac-sie', ...LN, round: 'Jornada 14', status: 'scheduled', kickoff: '20:30', home: T.RAC, away: T.SIE },
  { id: 'val-mon', ...LN, round: 'Jornada 13', status: 'finished', kickoff: 'Ayer', home: T.VAL, away: T.MON, score: [1, 1] },
  { id: 'sie-atn', ...LN, round: 'Jornada 13', status: 'finished', kickoff: 'Ayer', home: T.SIE, away: T.ATN, score: [0, 2] },
  { id: 'est-slu', ...CR, round: 'Cuartos de final', status: 'live', minute: "81'", home: T.EST, away: T.SLU, score: [1, 3] },
  { id: 'ula-atb', ...CR, round: 'Cuartos de final', status: 'scheduled', kickoff: '22:00', home: T.ULA, away: T.ATB },
];

// Tabla de posiciones por liga. gd = diferencia de gol; form = últimos 5 (G/E/P).
const row = (t, played, won, drawn, lost, gd, form) => ({ team: t, played, won, drawn, lost, gd, pts: won * 3 + drawn, form });

export const STANDINGS = {
  'liga-nacional': [
    row(T.ATN, 14, 9, 3, 2, 14, 'GGEGG'),
    row(T.RCO, 14, 8, 3, 3, 9, 'GPGEG'),
    row(T.DEP, 14, 7, 4, 3, 6, 'EGGPE'),
    row(T.VAL, 14, 6, 4, 4, 2, 'EEGPG'),
    row(T.UNI, 14, 5, 4, 5, 0, 'PGEGP'),
    row(T.RAC, 14, 4, 4, 6, -4, 'PPEGE'),
    row(T.MON, 14, 3, 4, 7, -10, 'EPPEP'),
    row(T.SIE, 14, 2, 2, 10, -17, 'PPPGP'),
  ],
  'copa-regional': [
    row(T.SLU, 6, 4, 1, 1, 6, 'GGEGP'),
    row(T.EST, 6, 3, 2, 1, 3, 'EGGEP'),
    row(T.ATB, 6, 2, 1, 3, -2, 'PGPEG'),
    row(T.ULA, 6, 1, 0, 5, -7, 'PPGPP'),
  ],
};

export const HIGHLIGHTS = [
  { id: 'h1', title: "Gol de Ríos · 64'", duration: '0:48', thumb: null, href: '#' },
  { id: 'h2', title: 'Resumen: Sur 3–0 Puerto', duration: '5:12', thumb: null, href: '#' },
  { id: 'h3', title: 'Top 5 atajadas jornada 13', duration: '1:30', thumb: null, href: '#' },
];
