import { fontSans, fontMono } from '@/theme/fonts';
import { siteConfig } from '@/config/site';
import { ServiceWorker } from '@/components/pwa/service-worker';
import '@/styles/globals.css';

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
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
