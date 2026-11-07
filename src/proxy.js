import { NextResponse } from 'next/server';

// Cuenta cada llamada al servidor (páginas, navegación dentro de la app y /api) para el panel /admin.
// No cuenta archivos estáticos, prefetch de enlaces, la tarea programada ni las imágenes de las notificaciones. Se escribe después de responder.
// El contador (firebase-admin) se carga aparte: si falla, solo se pierde el conteo y la página responde igual.
const SESSION_COOKIE = 'm90_token'; // igual que en server-session.js

export function proxy(request, event) {
  const { pathname } = request.nextUrl;
  const prefetch = request.headers.get('next-router-prefetch') || request.headers.get('purpose') === 'prefetch';
  if (!prefetch && !pathname.startsWith('/api/cron') && !pathname.startsWith('/api/push-image')) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    event.waitUntil(
      import('@/lib/usage/track')
        .then(({ trackRequest }) => trackRequest(token, pathname))
        .catch((e) => console.warn('usage', e.message)),
    );
  }
  return NextResponse.next();
}

export const config = {
  // Todo menos estáticos de Next, íconos, service worker, manifest y archivos con extensión.
  matcher: ['/((?!_next/|pwa-icon|apple-icon|icon|sw\\.js|manifest\\.webmanifest|favicon\\.ico|.*\\.[a-z0-9]+$).*)'],
};
