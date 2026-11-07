# Pelibox — PWA de fútbol

Next.js 16 (App Router) · React 19 · JavaScript (sin TypeScript) · CSS Modules · Design tokens.
Interfaz "Estadio nocturno", responsive móvil / tablet / escritorio.

## Arrancar
Requiere Node 20.9 o superior.
```bash
npm install
npm run dev
```

## Firebase (login y datos de usuario)

1. En Firebase Console activa **Authentication → Correo/contraseña** y **Google**, y crea **Firestore**.
2. Copia `.env.example` a `.env.local` y llena los valores de tu app web. Sin esto `/entrar` y el build fallan.
3. Publica las reglas: `npx firebase-tools deploy --only firestore:rules`.

La estructura de la base de datos está documentada al inicio de `firestore.rules`.
Código en `src/lib/firebase/` (`auth.js`, `db.js`, `useUser.js`); pantalla de login en `/entrar`.

## Dependencias
| Paquete | Tipo | Para qué |
|---|---|---|
| `next` | runtime | framework, rutas, `next/font`, caché de `fetch` |
| `react`, `react-dom` | runtime | UI |
| `firebase` | runtime | login (correo + Google) y Firestore |
| `eslint`, `eslint-config-next` | dev | `npm run lint` |

Sin librerías extra a propósito: los datos de la API se piden con `fetch` nativo desde el servidor
(route handlers / server components) usando la caché de Next (`revalidate`), así la API key nunca llega al navegador.
Rutas: `/` (Inicio) y `/partido/atn-rco` (Partido en vivo).

## Estructura
```
src/
  theme/            ← TODO el diseño parametrizado
    tokens.js         colores, tipografía, espacios, radios, tamaños, tiempos, breakpoints
    fonts.js          familias tipográficas (next/font)
    cssVariables.js   convierte tokens → variables CSS --pb-*
  config/
    site.js           nombre de la app, descripción, colores PWA
    navigation.js     menú, filtros, "siguiendo"
  styles/globals.css  reset y estilos base
  app/                rutas (layout, manifest, páginas)
  components/
    ui/               átomos reutilizables (Button, Chip, Tabs, Media, SplitBar…)
    layout/           AppShell, Sidebar, BottomNav, TopBar
    match/            componentes de fútbol (FeaturedMatch, MatchRow, Scoreboard…)
    pwa/              InstallCard, ServiceWorker
  lib/
    api/matches.js    capa de datos (cámbiala por tu API)
    mocks/            datos de ejemplo
    utils/cx.js       helper de clases
public/sw.js          service worker (red primero, cache de respaldo)
```

## Convenciones
- Un componente = una carpeta: `Nombre/Nombre.jsx`, `Nombre.module.css`, `index.js`.
- Componentes en PascalCase; clases CSS en camelCase.
- Importa siempre desde el barrel del grupo: `import { Button, Chip } from '@/components/ui'`.
- `'use client'` solo donde hay estado o eventos del navegador (TopBar, VideoPlayer, PredictionBar, MatchTabs, FollowToggle, pwa/*).
- Ningún color, tamaño de letra o espaciado escrito a mano en CSS: siempre `var(--pb-…)`.

## Tokens
Nombre de variable: `--pb-{categoría}-{nombre}` (camelCase → kebab-case).

| tokens.js              | CSS                          |
|------------------------|------------------------------|
| color.accent           | var(--pb-color-accent)       |
| color.surface1         | var(--pb-color-surface-1)    |
| fontSize.scoreLg       | var(--pb-font-size-score-lg) |
| fontWeight.black       | var(--pb-font-weight-black)  |
| space[4]               | var(--pb-space-4)            |
| radius.pill            | var(--pb-radius-pill)        |
| size.sidebar           | var(--pb-size-sidebar)       |

Para cambiar la marca: edita `color.accent` en `tokens.js`, la fuente en `fonts.js` y el nombre en `config/site.js`.

Breakpoints: 768px (tablet) y 1200px (escritorio). Están en `tokens.breakpoints`; en las media queries se escriben literal porque CSS no acepta variables ahí.

## PWA
- `app/manifest.js` genera `/manifest.webmanifest`.
- Agrega `public/icons/icon-192.png` e `icon-512.png`.
- El service worker solo se registra en producción (`npm run build && npm start`).
