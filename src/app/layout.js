import { fontSans, fontMono } from '@/theme/fonts';
import { siteConfig } from '@/config/site';
import { ServiceWorker } from '@/components/pwa/service-worker';
import { MomentsProvider } from '@/components/moments/moments-provider';
import { SessionSync } from '@/components/game/session-sync';
import { Toaster } from '@/components/toast/toaster';
import '@/styles/globals.css';

// Todas las páginas se generan al visitarlas: así el build/deploy no depende de que las APIs respondan.
// Las consultas a las APIs siguen cacheadas y compartidas (revalidate en cada fetch).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: siteConfig.shortName },
};

export const viewport = {
  themeColor: siteConfig.themeColor,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang={siteConfig.locale} className={`dark ${fontSans.variable} ${fontMono.variable}`}>
      <body>
        <MomentsProvider>{children}</MomentsProvider>
        <ServiceWorker />
        <SessionSync />
        <Toaster />
      </body>
    </html>
  );
}
