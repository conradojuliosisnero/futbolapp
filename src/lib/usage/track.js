import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { verifyToken } from '@/lib/firebase/server-session';
import { dayKey } from '@/lib/game/rules.mjs';

// Conteo de peticiones al servidor por usuario y por día (lo muestra /admin). Una escritura por petición.
// usage/{día}                 { total, anon, users }  totales del día
// usage/{día}/users/{uid}     { count, email, lastAt, lastPath }
export async function trackRequest(token, path) {
  const db = adminDb();
  if (!db) return;
  const user = await verifyToken(token);
  const day = db.collection('usage').doc(dayKey());
  const batch = db.batch();
  batch.set(day, { total: FieldValue.increment(1), ...(user ? {} : { anon: FieldValue.increment(1) }) }, { merge: true });
  if (user) {
    batch.set(day.collection('users').doc(user.uid), {
      count: FieldValue.increment(1), email: user.email ?? null, lastAt: FieldValue.serverTimestamp(), lastPath: path.slice(0, 120),
    }, { merge: true });
  }
  await batch.commit();
}
