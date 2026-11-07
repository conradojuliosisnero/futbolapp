// Motor del partido de prueba: estado puro + reducer (sin React), para poder probarlo aislado.

export const HOME = { id: null, code: 'ATN', name: 'Atlético Norte', crest: null };
export const AWAY = { id: null, code: 'RCO', name: 'Real Costa', crest: null };

const XI = {
  home: ['Vera', 'Luna', 'Castro', 'Ibarra', 'Rojas', 'Ortega', 'Méndez', 'Díaz', 'Ríos', 'Navarro', 'Silva'],
  away: ['Paz', 'Pérez', 'Molina', 'Herrera', 'Campos', 'Sosa', 'Reyes', 'Cruz', 'Flores', 'Vargas', 'Ruiz'],
};
const BENCH = { home: ['Gómez', 'Torres', 'Acosta'], away: ['Medina', 'Suárez', 'Ríos B.'] };
const GRID_433 = ['1:1', '2:4', '2:3', '2:2', '2:1', '3:3', '3:2', '3:1', '4:3', '4:2', '4:1'];
const POS_433 = ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'DEL', 'DEL', 'DEL'];

const lineup = (side) => ({
  formation: '4-3-3',
  coach: side === 'home' ? 'R. Álvarez' : 'M. Quintero',
  startXI: XI[side].map((name, i) => ({ id: null, number: i + 1, name, pos: POS_433[i], grid: GRID_433[i], photo: null })),
  subs: BENCH[side].map((name, i) => ({ id: null, number: 12 + i, name, pos: 'MED', photo: null })),
});

const STAT_KEYS = ['Posesión %', 'Tiros', 'Tiros a puerta', 'Córners', 'Faltas', 'Amarillas', 'Rojas'];

export function initialState() {
  return {
    phase: 'scheduled', // scheduled | first | half | second | finished
    minute: 0,
    score: [0, 0],
    events: [], // más reciente primero
    stats: Object.fromEntries(STAT_KEYS.map((k) => [k, k === 'Posesión %' ? [50, 50] : [0, 0]])),
    lastEvent: null,
    seq: 0,
  };
}

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];
const sideIdx = (side) => (side === 'home' ? 0 : 1);
const teamOf = (side) => (side === 'home' ? HOME : AWAY);
const bump = (stats, key, side, n = 1) => {
  const v = [...stats[key]]; v[sideIdx(side)] += n; return { ...stats, [key]: v };
};
const min = (s) => `${s.minute}'`;

function push(s, ev) {
  const event = { id: s.seq + 1, min: min(s), ...ev };
  return { ...s, seq: s.seq + 1, events: [event, ...s.events], lastEvent: event };
}

/** Eventos que se pueden disparar a mano o en automático. */
export const EVENT_TYPES = ['goal', 'yellow', 'red', 'sub', 'var', 'missed-penalty'];

export function reducer(s, a) {
  const rnd = a.rnd ?? Math.random;
  const live = s.phase === 'first' || s.phase === 'second';
  switch (a.type) {
    case 'reset':
      return initialState();
    case 'start':
      if (s.phase !== 'scheduled') return s;
      return push({ ...s, phase: 'first', minute: 1 }, { type: 'kickoff', side: null, title: '¡Rueda el balón!', text: `${HOME.name} vs ${AWAY.name}` });
    case 'halftime':
      if (s.phase !== 'first') return s;
      return push({ ...s, phase: 'half', minute: 45 }, { type: 'halftime', side: null, title: 'Medio tiempo', text: `${HOME.code} ${s.score[0]}–${s.score[1]} ${AWAY.code}` });
    case 'resume':
      if (s.phase !== 'half') return s;
      return push({ ...s, phase: 'second', minute: 46 }, { type: 'kickoff', side: null, title: 'Comienza el segundo tiempo' });
    case 'end':
      if (!live && s.phase !== 'half') return s;
      return push({ ...s, phase: 'finished', minute: Math.max(s.minute, 90) }, { type: 'final', side: null, title: 'Final del partido', text: `${HOME.code} ${s.score[0]}–${s.score[1]} ${AWAY.code}` });
    case 'tick': {
      if (!live) return s;
      if (s.phase === 'first' && s.minute >= 45) return reducer(s, { type: 'halftime' });
      if (s.phase === 'second' && s.minute >= 90) return reducer(s, { type: 'end' });
      // La posesión se mueve un poco cada minuto.
      const p = Math.max(30, Math.min(70, s.stats['Posesión %'][0] + Math.round((rnd() - 0.5) * 4)));
      return { ...s, minute: s.minute + 1, stats: { ...s.stats, 'Posesión %': [p, 100 - p] } };
    }
    case 'event': {
      if (!live) return s;
      const side = a.side, team = teamOf(side), player = pick(XI[side], rnd);
      let stats = s.stats;
      switch (a.event) {
        case 'goal': {
          const score = [...s.score]; score[sideIdx(side)] += 1;
          stats = bump(bump(stats, 'Tiros', side), 'Tiros a puerta', side);
          return push({ ...s, score, stats }, { type: 'goal', side, player, title: `¡GOL! ${team.name}`, text: `${player} · ${score[0]}–${score[1]}` });
        }
        case 'yellow':
          return push({ ...s, stats: bump(bump(stats, 'Amarillas', side), 'Faltas', side) }, { type: 'yellow', side, player, title: `Amarilla · ${player} (${team.code})` });
        case 'red':
          return push({ ...s, stats: bump(bump(stats, 'Rojas', side), 'Faltas', side) }, { type: 'red', side, player, title: `Roja · ${player} (${team.code})` });
        case 'sub':
          return push(s, { type: 'sub', side, player, title: `Cambio · ${team.name}`, text: `${pick(BENCH[side], rnd)} ↔ ${player}` });
        case 'var':
          return push({ ...s, stats: bump(stats, 'Tiros', side) }, { type: 'var', side, player, title: `VAR · Gol anulado a ${team.code}`, text: `Fuera de juego de ${player}` });
        case 'missed-penalty':
          return push({ ...s, stats: bump(stats, 'Tiros', side) }, { type: 'var', side, player, title: `Penal fallado · ${player} (${team.code})` });
        default:
          return s;
      }
    }
    case 'random': {
      // Modo automático: ~1 evento cada 6 minutos, con goles menos frecuentes que faltas.
      if (!live || rnd() > 0.17) return s;
      const ev = pick(['goal', 'yellow', 'yellow', 'sub', 'sub', 'var', 'red', 'missed-penalty', 'goal'], rnd);
      return reducer(s, { type: 'event', event: ev, side: rnd() < 0.5 ? 'home' : 'away', rnd });
    }
    default:
      return s;
  }
}

/** Convierte el estado al mismo formato de partido que usan las pantallas reales. */
export function toMatch(s) {
  const live = s.phase === 'first' || s.phase === 'second' || s.phase === 'half';
  const minute = s.phase === 'half' ? 'MT' : live ? `${s.minute}'` : null;
  return {
    id: 'prueba',
    leagueId: null,
    league: 'Partido de prueba',
    round: 'Simulación',
    status: s.phase === 'scheduled' ? 'scheduled' : s.phase === 'finished' ? 'finished' : 'live',
    minute,
    clock: minute,
    progress: Math.min(1, s.minute / 90),
    kickoff: 'Ahora',
    utc: Date.now(),
    day: 'Hoy',
    label: minute ?? (s.phase === 'finished' ? 'Final' : 'Ahora'),
    home: HOME,
    away: AWAY,
    score: s.phase === 'scheduled' ? undefined : s.score,
    events: s.events,
    stats: STAT_KEYS.map((label) => ({ label, home: s.stats[label][0], away: s.stats[label][1] })),
    lineups: { home: lineup('home'), away: lineup('away') },
    prediction: { home: 48, draw: 22, away: 30, votes: 'simulado' },
  };
}
