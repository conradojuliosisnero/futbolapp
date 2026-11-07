import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/firebase/server-session';
import { trackRequest } from '@/lib/usage/track';

// Cuenta cada llamada al servidor (páginas, navegación dentro de la app y /api) para el panel /admin.
// No cuenta archivos estáticos, prefetch de enlaces ni la tarea programada. Se escribe después de responder.
export function proxy(request, event) {
  const { pathname } = request.nextUrl;
  const prefetch = request.headers.get('next-router-prefetch') || request.headers.get('purpose') === 'prefetch';
  if (!prefetch && !pathname.startsWith('/api/cron')) {
    event.waitUntil(trackRequest(request.cookies.get(SESSION_COOKIE)?.value, pathname).catch((e) => console.warn('usage', e.message)));
  }
  return NextResponse.next();
}

export const config = {
  // Todo menos estáticos de Next, íconos, service worker, manifest y archivos con extensión.
  matcher: ['/((?!_next/|pwa-icon|apple-icon|icon|sw\.js|manifest\.webmanifest|favicon\.ico|.*\.[a-z0-9]+$).*)'],
};
