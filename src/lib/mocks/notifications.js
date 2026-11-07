// Avisos de prueba (bandeja de notificaciones). type: 'goal' | 'kickoff' | 'final' | 'card' | 'reminder'
export const NOTIFICATIONS = [
  { id: 'n1', type: 'goal', title: '¡GOL! Atlético Norte 2–1', text: "M. Ríos de cabeza tras córner al 64'.", time: 'Hace 3 min', url: '/partido/atn-rco', read: false },
  { id: 'n2', type: 'card', title: 'Tarjeta amarilla · Real Costa', text: "J. Pérez al 58'.", time: 'Hace 9 min', url: '/partido/atn-rco', read: false },
  { id: 'n3', type: 'kickoff', title: 'Empezó Deportivo Sur vs Unión Valle', text: 'Liga Nacional · Jornada 14', time: 'Hace 32 min', url: '/partido/dep-uni', read: true },
  { id: 'n4', type: 'reminder', title: 'Racing Puerto vs Club Sierra a las 20:30', text: 'Te avisaremos cuando empiece.', time: 'Hace 1 h', url: '/partido/rac-sie', read: true },
  { id: 'n5', type: 'final', title: 'Final: Club Sierra 0–2 Atlético Norte', text: 'Tu equipo sumó 3 puntos y sigue líder.', time: 'Ayer', url: '/mi-equipo', read: true },
];
