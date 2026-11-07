'use client';
// Llamadas de la app a las rutas de puntos. El servidor decide cuánto suma; aquí solo se avisa con el toast.
import { auth } from '@/lib/firebase/client';

const listeners = new Set();
/** Escucha "ganaste N puntos" (lo usa PointsToast). */
export const onPoints = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = (n, reason) => { if (n > 0) listeners.forEach((fn) => fn(n, reason)); };

async function post(path, body, reason) {
  const user = auth?.currentUser;
  if (!user) return { added: 0, error: 'login' };
  const res = await fetch(path, {
    method: 'POST',
    keepalive: true, // la noticia abre otra pestaña: que la petición no se corte
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { added: 0, error: data.error ?? 'error' };
  emit(data.added, reason);
  return data;
}

export const dailyCheckin = () => post('/api/game/checkin', {}, 'Racha del día');
export const newsRead = (url) => post('/api/game/news', { url }, 'Noticia leída');
export const castVote = (matchId, pick) => post('/api/game/vote', { matchId, pick }, 'Voto');
