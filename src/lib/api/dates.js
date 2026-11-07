import { siteConfig } from '@/config/site';

// Fechas en la zona horaria de la app (compartido por todos los proveedores).
const TZ = siteConfig.timeZone;
export const DAY = 86_400_000;

export const dayKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date); // 2026-11-07
export const time = (date) => new Intl.DateTimeFormat('es', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);

export function dayLabel(date) {
  const k = dayKey(date), now = Date.now();
  if (k === dayKey(now)) return null;
  if (k === dayKey(now + DAY)) return 'Mañana';
  if (k === dayKey(now - DAY)) return 'Ayer';
  return new Intl.DateTimeFormat('es', { timeZone: TZ, weekday: 'short', day: 'numeric' }).format(date);
}

export function todayLabel() {
  return new Intl.DateTimeFormat('es', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(Date.now());
}

/** "Hace 5 min", "Hace 3 h", "12 nov" (para noticias). */
export function ago(date) {
  const mins = Math.round((Date.now() - Date.parse(date)) / 60000);
  if (mins < 60) return `Hace ${Math.max(1, mins)} min`;
  if (mins < 24 * 60) return `Hace ${Math.round(mins / 60)} h`;
  return new Intl.DateTimeFormat('es', { timeZone: TZ, day: 'numeric', month: 'short' }).format(Date.parse(date));
}
