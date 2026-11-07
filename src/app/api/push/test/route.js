import { setVapidDetails, sendNotification } from 'web-push';

// Envía un push de prueba a la suscripción que manda el propio dispositivo.
// shortcut: sin login cualquiera puede llamar esta ruta con SU suscripción; cuando haya Firebase, exigir sesión
// y enviar desde el servidor a las suscripciones guardadas en users/{uid}/pushSubscriptions.

const { NEXT_PUBLIC_VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subject } = process.env;

function isValidSubscription(s) {
  try {
    return typeof s?.endpoint === 'string'
      && new URL(s.endpoint).protocol === 'https:'
      && typeof s.keys?.p256dh === 'string'
      && typeof s.keys?.auth === 'string';
  } catch { return false; }
}

export async function POST(request) {
  if (!pub || !priv) return Response.json({ error: 'Las notificaciones push no están disponibles.' }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!isValidSubscription(body?.subscription)) return Response.json({ error: 'Suscripción inválida.' }, { status: 400 });

  setVapidDetails(subject || 'mailto:soporte@futbolapp.app', pub, priv);
  try {
    await sendNotification(body.subscription, JSON.stringify({
      title: 'Minuto 90 · notificación de prueba',
      body: 'Así te avisaremos de los goles de tus equipos.',
      url: '/partidos',
      tag: 'test',
    }));
    return Response.json({ ok: true });
  } catch (e) {
    // 404/410 = la suscripción ya no existe (el usuario la revocó).
    return Response.json({ error: 'No se pudo enviar el push.', status: e.statusCode }, { status: 502 });
  }
}
