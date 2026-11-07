/**
 * Pelibox Design Tokens — tema "Estadio nocturno"
 * Fuente única de verdad: colores, tipografía, espaciado, radios, layout y movimiento.
 * Cada token se expone como variable CSS:  --pb-{categoria}-{nombre}
 *   color.surface1      -> var(--pb-color-surface-1)
 *   fontSize.display    -> var(--pb-font-size-display)
 */

export const color = {
  // Fondos y superficies
  bg: '#0c0d0c',
  surface1: '#151714',
  surface2: '#1a1c19',
  surface3: '#2a2d27',
  border: '#1f221d',
  borderStrong: '#262922',
  // Texto
  textPrimary: '#f1f2ee',
  textSecondary: '#9a9d93',
  textTertiary: '#8a8d84',
  textMuted: '#6f7369',
  textControl: '#b9bbb4',
  // Marca y estados
  accent: '#c6f432',
  accentContrast: '#0c0d0c',
  live: '#e8332b',
  liveContrast: '#ffffff',
  warning: '#f2c230',
  // Neutros de apoyo (escudos, barras secundarias)
  neutral1: '#3a3f35',
  neutral2: '#5b5f56',
  // Transparencias
  overlay: 'rgba(12, 13, 12, 0.95)',
  glass: 'rgba(30, 32, 28, 0.92)',
  scrim: 'rgba(255, 255, 255, 0.12)',
  shade: 'rgba(0, 0, 0, 0.6)',
  // Placeholders de medios
  placeholderA: '#1c1f1a',
  placeholderB: '#191b17',
};

export const fontFamily = {
  sans: 'var(--font-sans), Helvetica, Arial, sans-serif',
  mono: 'var(--font-mono), ui-monospace, monospace',
};

export const fontSize = {
  '2xs': '10px',
  xs: '11px',
  sm: '12px',
  md: '13px',
  base: '14px',
  lg: '15px',
  xl: '16px',
  '2xl': '18px',
  '3xl': '20px',
  '4xl': '22px',
  '5xl': '26px',
  score: '40px',
  scoreLg: '52px',
  display: '72px',
};

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

export const lineHeight = { none: 1, tight: 1.1, snug: 1.4, normal: 1.5 };

export const letterSpacing = { tight: '-0.03em', normal: '0', wide: '0.04em', wider: '0.06em' };

export const space = {
  0: '0', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px',
  6: '24px', 7: '28px', 8: '32px', 9: '36px', 10: '48px',
};

export const radius = {
  xs: '2px', sm: '6px', md: '12px', lg: '16px', xl: '18px',
  '2xl': '20px', '3xl': '24px', '4xl': '28px', pill: '999px',
};

export const size = {
  touch: '44px',
  sidebar: '240px',
  sidebarCompact: '84px',
  rail: '380px',
  railWide: '400px',
  bottomNav: '64px',
  heroMobile: '320px',
  heroDesktop: '440px',
};

export const duration = { fast: '150ms', base: '250ms', pulse: '1.4s' };

/** Breakpoints (no son variables CSS: las media queries no las aceptan). */
export const breakpoints = { tablet: 768, desktop: 1200 };

export const tokens = { color, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, space, radius, size, duration };
export default tokens;
