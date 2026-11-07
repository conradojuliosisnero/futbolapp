import 'server-only';
import { setVapidDetails, sendNotification } from 'web-push';
import { FieldValue } from 'firebase-admin/firestore';
import { wants } from './engine.mjs';

let vapidReady = false;
function vapid() {
  if (vapidReady) return true;
  const { NEXT_PUBLIC_VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subject } = process.env;
  if (!pub || !priv) return false;
  setVapidDetails(subject || 'mailto:soporte@minuto90.app', pub, priv);
  return (vapidReady = true);
}

const TYPE = { goals: 'goal', redCards: 'card', kickoff: 'kickoff', final: 'final', teamNews: 'news', reminders: 'reminder' };

/**
 * Entrega un aviso a cada usuario que lo quiere: lo guarda en su bandeja y lo envía por push a sus dispositivos.
 * users: [{ uid, notify }]. Devuelve cuántos push salieron.
 */
export async function deliver(db, users, n) {
  const canPush = vapid();
  let sent = 0;
  for (const u of users) {
    if (!wants(u.notify, n.pref)) continue;
    const userRef = db.collection('users').doc(u.uid);
    await userRef.collection('notifications').add({
      type: TYPE[n.pref] ?? 'reminder', title: n.title, text: n.body ?? '', url: n.url, read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    if (!canPush) continue;
    const subs = await userRef.collection('pushSubscriptions').get();
    await Promise.all(subs.docs.map(async (doc) => {
      const { endpoint, keys } = doc.data();
      try {
        await sendNotification({ endpoint, keys }, JSON.stringify({ title: n.title, body: n.body, url: n.url, tag: n.tag }), { TTL: 3600 });
        sent++;
      } catch (e) {
        // 404/410: el usuario desinstaló o revocó el permiso → se borra el dispositivo.
        if (e.statusCode === 404 || e.statusCode === 410) await doc.ref.delete();
        else console.warn('push falló', e.statusCode ?? e.message);
      }
    }));
  }
  return sent;
}
