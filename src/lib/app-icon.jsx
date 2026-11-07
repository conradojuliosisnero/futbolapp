import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

// Icono de la app: la marca (siteConfig.logoMark + ".") en verde lima sobre el fondo oscuro del tema.
// maskable: deja margen de seguridad (Android recorta el icono en círculo o "squircle").
export function appIcon(size, { maskable = false } = {}) {
  const font = Math.round(size * (maskable ? 0.46 : 0.62));
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c0d0c', borderRadius: maskable ? 0 : size * 0.22 }}>
        <div style={{ display: 'flex', fontSize: font, fontWeight: 900, color: '#f1f2ee', letterSpacing: -font * 0.05, lineHeight: 1, marginTop: -font * 0.08 }}>
          {siteConfig.logoMark}<span style={{ color: '#c6f432' }}>.</span>
        </div>
      </div>
    ),
    { width: size, height: size, headers: { 'Cache-Control': 'public, max-age=604800, immutable' } },
  );
}
