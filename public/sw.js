const VERSION = 'futbolapp-v2';
const PAGES = `${VERSION}-pages`;   // páginas: red primero, copia de respaldo sin conexión
const STATIC = `${VERSION}-static`; // /_next/static: nunca cambian (el nombre lleva hash) → caché primero
const IMAGES = 'futbolapp-images';  // fotos de jugadores: caché primero, se conserva entre versiones
const MAX_IMAGES = 300;             // al pasar este tope se borran las más antiguas
const ASSETS = ['/', '/manifest.webmanifest', '/pwa-icon/192'];

// Fotos que se guardan en el dispositivo. (Los escudos de football-data ya los guarda el navegador 30 días por su cuenta.)
const IMAGE_HOSTS = ['media.api-sports.io'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  const keep = new Set([PAGES, STATIC, IMAGES]);
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => !keep.has(k)).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// Borra las entradas más antiguas (caches.keys devuelve en orden de inserción).
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

async function cacheFirst(request, cacheName, { cors = false, max } = {}) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request.url);
  if (hit) return hit;
  // cors: guarda una respuesta legible (no "opaca"), que ocupa su tamaño real en el almacenamiento.
  const res = await fetch(cors ? new Request(request.url, { mode: 'cors', credentials: 'omit' }) : request);
  if (res.ok) {
    await cache.put(request.url, res.clone());
    if (max) trim(cacheName, max);
  }
  return res;
}

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (IMAGE_HOSTS.includes(url.hostname)) {
    e.respondWith(cacheFirst(request, IMAGES, { cors: true, max: MAX_IMAGES }).catch(() => fetch(request)));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(cacheFirst(request, STATIC));
    return;
  }
  if (url.pathname.startsWith('/api/')) return; // nunca se guarda lo de la API propia (push)
  // Red primero, copia de respaldo (los marcadores deben estar frescos)
  e.respondWith(
    fetch(request)
      .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(PAGES).then((c) => c.put(request, copy)); } return res; })
      .catch(() => caches.match(request))
  );
});

// Notificaciones push. Payload JSON: { title, body, url, tag, kind, icon, image, matchId } (ver src/lib/notify/look.mjs).
// Siempre se muestra una notificación: iOS revoca el permiso si un push llega sin mostrar nada.
// iPhone solo muestra título y texto; Android y Chrome de escritorio también escudo, imagen, badge, botones y vibración.
const VIBRATE = {
  goal: [200, 80, 200, 80, 500],
  red: [350, 120, 350],
  kickoff: [120, 60, 120],
  final: [200, 100, 200, 100, 200, 100, 700],
  news: [80],
  test: [200, 80, 200, 80, 500],
};

self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { body: e.data?.text() }; }
  const actions = data.matchId
    ? [{ action: 'open', title: 'Ver partido' }, { action: 'mute', title: 'Silenciar partido' }]
    : [{ action: 'open', title: 'Abrir' }];
  e.waitUntil(self.registration.showNotification(data.title || 'Minuto 90', {
    body: data.body || '',
    icon: data.icon || '/pwa-icon/192', // escudo del equipo (o el ícono de la app)
    badge: '/pwa-icon/badge',            // silueta blanca para la barra de estado de Android
    image: data.image || undefined,      // marcador al estilo de la app (/api/push-image)
    tag: data.tag,                       // mismo tag = reemplaza la anterior del mismo partido…
    renotify: Boolean(data.tag),         // …pero vuelve a sonar y vibrar
    vibrate: VIBRATE[data.kind] ?? [120],
    timestamp: Date.now(),
    actions,
    data: { url: data.url || '/', matchId: data.matchId ?? null },
  }));
});

/** "Silenciar partido": el servidor deja de mandar avisos de ese partido a este dispositivo. */
async function muteMatch(matchId) {
  const sub = await self.registration.pushManager.getSubscription();
  if (!sub || !matchId) return;
  const res = await fetch('/api/push/mute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint, matchId }),
  }).catch(() => null);
  await self.registration.showNotification(res?.ok ? 'Partido silenciado' : 'No se pudo silenciar', {
    body: res?.ok ? 'No te avisaremos más de este partido en este dispositivo.' : 'Intenta de nuevo desde la app.',
    icon: '/pwa-icon/192', badge: '/pwa-icon/badge', tag: `mute-${matchId}`, silent: true,
  });
}

// Al tocar la notificación (o "Ver partido"): enfoca la app si ya está abierta, si no la abre en la URL del aviso.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'mute') { e.waitUntil(muteMatch(e.notification.data?.matchId)); return; }
  const url = new URL(e.notification.data?.url || '/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
    const win = wins.find((w) => w.url.startsWith(self.location.origin));
    if (win) return win.navigate(url).then((w) => (w || win).focus());
    return self.clients.openWindow(url);
  }));
});
