import { fontSans, fontMono } from '@/theme/fonts';
import { buildCssVariables } from '@/theme';
import { siteConfig } from '@/config/site';
import { ServiceWorker } from '@/components/pwa';
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
    <html lang={siteConfig.locale} className={`${fontSans.variable} ${fontMono.variable}`}>
      <head>
        <style id="pb-tokens" dangerouslySetInnerHTML={{ __html: buildCssVariables() }} />
      </head>
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
