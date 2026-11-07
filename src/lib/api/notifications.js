// Bandeja de avisos. Hoy lee mocks; con Firebase saldrá de users/{uid}/notifications.
import { NOTIFICATIONS } from '@/lib/mocks/notifications';

export async function getNotifications() {
  return NOTIFICATIONS;
}
