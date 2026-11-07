import { FieldPath } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';

// Botón "Silenciar partido" de la notificación (lo llama el service worker, que no tiene sesión de Firebase).
// Se identifica el dispositivo por su endpoint de push: es secreto y solo lo conoce ese navegador.
// Queda en users/{uid}/pushSubscriptions/{id}.muted = { [matchId]: ms } y deliver() lo respeta.
const DAY = 86_400_000;

export async function POST(request) {
  const db = adminDb();
  if (!db) return Response.json({ error: 'No disponible.' }, { status: 503 });
  const { endpoint, matchId } = (await request.json().catch(() => null)) ?? {};
  let ok = typeof matchId === 'string' && matchId.length <= 60 && typeof endpoint === 'string' && endpoint.length <= 1000;
  try { ok = ok && new URL(endpoint).protocol === 'https:'; } catch { ok = false; }
  if (!ok) return Response.json({ error: 'Datos inválidos.' }, { status: 400 });

  const snap = await db.collectionGroup('pushSubscriptions').where('endpoint', '==', endpoint).limit(1).get();
  if (snap.empty) return Response.json({ error: 'Dispositivo no encontrado.' }, { status: 404 });
  const ref = snap.docs[0].ref;
  // Se limpian los silencios de hace más de 2 días (el partido ya terminó).
  const now = Date.now();
  const kept = Object.fromEntries(Object.entries(snap.docs[0].data().muted ?? {}).filter(([, t]) => now - t < 2 * DAY));
  await ref.update(new FieldPath('muted'), { ...kept, [matchId]: now });
  return Response.json({ ok: true });
}
