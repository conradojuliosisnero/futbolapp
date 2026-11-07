import { appIcon, badgeIcon } from '@/lib/app-icon';

// /pwa-icon/192 · /pwa-icon/512 · /pwa-icon/512-maskable (manifest y notificaciones) · /pwa-icon/badge (barra de estado de Android).
const ALLOWED = { '192': [192, false], '512': [512, false], '512-maskable': [512, true], badge: [96, false] };

export function generateStaticParams() {
  return Object.keys(ALLOWED).map((size) => ({ size }));
}

export async function GET(_req, { params }) {
  const { size } = await params;
  const conf = ALLOWED[size];
  if (!conf) return new Response('No encontrado', { status: 404 });
  if (size === 'badge') return badgeIcon(conf[0]);
  return appIcon(conf[0], { maskable: conf[1] });
}
