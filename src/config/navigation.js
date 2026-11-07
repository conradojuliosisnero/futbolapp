import { House } from '@/components/animate-ui/icons/house';
import { Radio } from '@/components/animate-ui/icons/radio';
import { CalendarDays } from '@/components/animate-ui/icons/calendar-days';
import { Trophy } from '@/components/animate-ui/icons/trophy';
import { Star } from '@/components/animate-ui/icons/star';
import { Bell } from '@/components/animate-ui/icons/bell';
import { Newspaper } from 'lucide-react';

// Iconos animados de Animate UI: se mueven al pasar el cursor/tocar el ítem y al llegar a la sección.

// mobile: aparece en la barra inferior del celular. Las demás solo en la barra lateral (tablet/escritorio).
export const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', href: '/', icon: House, mobile: true },
  { id: 'en-vivo', label: 'En vivo', href: '/partidos', icon: Radio, badgeKey: 'live' },
  { id: 'partidos', label: 'Partidos', href: '/partidos', icon: CalendarDays, mobile: true },
  { id: 'ligas', label: 'Ligas', href: '/ligas', icon: Trophy, mobile: true },
  { id: 'mi-equipo', label: 'Mi equipo', href: '/mi-equipo', icon: Star, mobile: true },
  { id: 'noticias', label: 'Noticias', href: '/noticias', icon: Newspaper, mobile: true },
  { id: 'notificaciones', label: 'Notificaciones', href: '/notificaciones', icon: Bell },
];

export const HOME_FILTERS = [
  { id: 'live', label: 'En vivo' },
  { id: 'today', label: 'Hoy' },
  { id: 'tomorrow', label: 'Mañana' },
  { id: 'leagues', label: 'Ligas' },
];
