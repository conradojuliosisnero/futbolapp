// Web Push del lado del navegador (Android, escritorio e iOS 16.4+ con la app instalada).

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Estado del dispositivo para mostrar el mensaje correcto:
 * 'unsupported' | 'ios-install' (iPhone sin instalar) | 'unconfigured' (faltan claves) | 'default' | 'granted' | 'denied'
 */
export function getPushState() {
  if (typeof window === 'undefined') return 'unsupported';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (ios && !standalone) return 'ios-install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  if (!VAPID_PUBLIC_KEY) return 'unconfigured';
  return Notification.permission;
}

// La clave VAPID viaja en base64url; PushManager la pide como bytes.
function toBytes(base64url) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Debe llamarse desde un toque del usuario (iOS lo exige). Devuelve la suscripción o lanza error. */
export async function subscribeToPush() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('permission-denied');
  // Se registra aquí también para que funcione en desarrollo (en producción ya lo registra <ServiceWorker />).
  await navigator.serviceWorker.register('/sw.js');
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  // shortcut: la suscripción solo vive en el navegador; con Firebase se guarda en users/{uid}/pushSubscriptions.
  return existing ?? reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(VAPID_PUBLIC_KEY) });
}

export async function unsubscribeFromPush() {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  await sub?.unsubscribe();
}

export async function getCurrentSubscription() {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription()) ?? null;
}

/** Pide al servidor que envíe un push de prueba a este dispositivo. */
export async function sendTestPush(subscription) {
  const res = await fetch('/api/push/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'push-failed');
}
