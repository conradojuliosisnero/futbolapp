import 'server-only';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { dayKey, currentStreak } from '@/lib/game/rules.mjs';

const DAY = 86_400_000;

/** Últimos `days` días (hora de Colombia), del más antiguo al de hoy. */
export const lastDays = (days) => Array.from({ length: days }, (_, i) => dayKey(Date.now() - (days - 1 - i) * DAY));

/**
 * Datos del panel: usuarios (Auth + Firestore) y peticiones por día.
 * Devuelve { days, totals: [{ day, total, anon, users }], users: [{ uid, email, name, ..., perDay: {día: n}, week, today }] }
 */
export async function adminData({ days = 14 } = {}) {
  const db = adminDb(), auth = adminAuth();
  const keys = lastDays(days);

  const [authUsers, docs, usage] = await Promise.all([
    auth.listUsers(1000).then((r) => r.users),
    db.collection('users').get(),
    Promise.all(keys.map(async (day) => {
      const ref = db.collection('usage').doc(day);
      const [d, u] = await Promise.all([ref.get(), ref.collection('users').get()]);
      return { day, total: d.data()?.total ?? 0, anon: d.data()?.anon ?? 0, byUser: Object.fromEntries(u.docs.map((x) => [x.id, x.data().count ?? 0])) };
    })),
  ]);

  const profile = Object.fromEntries(docs.docs.map((d) => [d.id, d.data()]));
  const today = keys.at(-1), week = keys.slice(-7);
  const users = authUsers.map((u) => {
    const p = profile[u.uid] ?? {};
    const perDay = Object.fromEntries(usage.map((x) => [x.day, x.byUser[u.uid] ?? 0]));
    return {
      uid: u.uid,
      email: u.email ?? '',
      name: u.displayName || p.displayName || '',
      photo: u.photoURL ?? null,
      provider: u.providerData.map((x) => x.providerId.replace('.com', '')).join(', ') || 'email',
      created: u.metadata.creationTime ? Date.parse(u.metadata.creationTime) : null,
      lastSeen: Date.parse(u.metadata.lastRefreshTime ?? u.metadata.lastSignInTime ?? '') || null,
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

  const totals = usage.map((x) => ({ day: x.day, total: x.total, anon: x.anon, users: Object.values(x.byUser).filter(Boolean).length }));
  const weekAgo = Date.now() - 7 * DAY;
  const newThisWeek = users.filter((u) => u.created > weekAgo).length;
  return { days: keys, totals, users, newThisWeek };
}
