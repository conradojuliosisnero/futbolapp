import { appIcon } from '@/lib/app-icon';

// Icono de iOS al "Agregar a inicio" (Next agrega <link rel="apple-touch-icon"> solo).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return appIcon(180, { maskable: true });
}
