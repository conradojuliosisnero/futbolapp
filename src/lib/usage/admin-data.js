import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { dayKey, currentStreak } from '@/lib/game/rules.mjs';

const DAY = 86_400_000;

/** Últimos `days` días (hora de Colombia), del más antiguo al de hoy. */
export const lastDays = (days) => Array.from({ length: days }, (_, i) => dayKey(Date.now() - (days - 1 - i) * DAY));

/**
 * Datos del panel: usuarios (Firestore) y peticiones por día.
 * Devuelve { days, totals: [{ day, total, anon, users }], users: [{ uid, email, name, ..., perDay: {día: n}, week, today }] }
 */
export async function adminData({ days = 14 } = {}) {
  const db = adminDb();
  const keys = lastDays(days);

  // Usuarios desde Firestore (users/{uid} lo crea la app al registrarse). No se usa firebase-admin/auth (ver admin.js).
  const [docs, usage] = await Promise.all([
    db.collection('users').get(),
    Promise.all(keys.map(async (day) => {
      const ref = db.collection('usage').doc(day);
      const [d, u] = await Promise.all([ref.get(), ref.collection('users').get()]);
      return {
        day, total: d.data()?.total ?? 0, anon: d.data()?.anon ?? 0,
        byUser: Object.fromEntries(u.docs.map((x) => [x.id, { count: x.data().count ?? 0, lastAt: x.data().lastAt?.toMillis?.() ?? null }])),
      };
    })),
  ]);

  const today = keys.at(-1), week = keys.slice(-7);
  const users = docs.docs.map((doc) => {
    const p = doc.data();
    const uid = doc.id;
    const perDay = Object.fromEntries(usage.map((x) => [x.day, x.byUser[uid]?.count ?? 0]));
    const lastSeen = Math.max(0, ...usage.map((x) => x.byUser[uid]?.lastAt ?? 0)) || null;
    return {
      uid,
      email: p.email ?? '',
      name: p.displayName || '',
      photo: p.photoURL ?? null,
      created: p.createdAt?.toMillis?.() ?? null,
      lastSeen,
      points: p.game?.points ?? 0,
      streak: currentStreak(p.game),
      favorites: Object.keys(p.favorites ?? {}).length,
      leagues: Object.keys(p.follows?.leagues ?? {}).length,
      perDay,
      today: perDay[today],
      week: week.reduce((n, d) => n + perDay[d], 0),
      total: keys.reduce((n, d) => n + perDay[d], 0),
    };
  }).sort((a, b) => b.today - a.today || b.week - a.week || (b.lastSeen ?? 0) - (a.lastSeen ?? 0));

  const totals = usage.map((x) => ({ day: x.day, total: x.total, anon: x.anon, users: Object.values(x.byUser).filter((u) => u.count).length }));
  const weekAgo = Date.now() - 7 * DAY;
  const newThisWeek = users.filter((u) => u.created > weekAgo).length;
  return { days: keys, totals, users, newThisWeek };
}
