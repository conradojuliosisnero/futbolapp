import { Archivo, JetBrains_Mono } from 'next/font/google';

// Cambia aquí la tipografía de toda la app.
export const fontSans = Archivo({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
});
