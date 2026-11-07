import { siteConfig } from '@/config/site';

export default function manifest() {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    lang: 'es',
    orientation: 'portrait',
    // Iconos generados por app/pwa-icon/[size] (no hay archivos de imagen que mantener).
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512-maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
