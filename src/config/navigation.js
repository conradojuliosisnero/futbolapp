export const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', href: '/', icon: '⌂', mobile: true },
  { id: 'en-vivo', label: 'En vivo', href: '/partido/atn-rco', icon: '●', badgeKey: 'live' },
  { id: 'partidos', label: 'Partidos', href: '/partidos', icon: '▦', mobile: true },
  { id: 'ligas', label: 'Ligas', href: '/ligas', icon: '◎', mobile: true },
  { id: 'mi-equipo', label: 'Mi equipo', href: '/mi-equipo', icon: '☆', mobile: true },
];

// shortcut: lo que sigue el usuario es fijo hasta tener login (luego sale de users/{uid}.follows).
export const FOLLOWING = [
  { id: 'atn', type: 'team', code: 'ATN', label: 'Atlético Norte', href: '/mi-equipo' },
  { id: 'liga-nacional', type: 'league', label: 'Liga Nacional', href: '/ligas/liga-nacional' },
];

export const HOME_FILTERS = [
  { id: 'live', label: 'En vivo' },
  { id: 'today', label: 'Hoy' },
  { id: 'tomorrow', label: 'Mañana' },
  { id: 'leagues', label: 'Ligas' },
];
