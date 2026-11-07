# Futbolapp — PWA de fútbol

Next.js 16 (App Router) · React 19 · JavaScript (sin TypeScript) · Tailwind CSS v4 · shadcn/ui · Animate UI.
Interfaz "Estadio nocturno", responsive móvil / tablet / escritorio.

## Arrancar
Requiere Node 20.9 o superior.
```bash
npm install
npm run dev
```

## Firebase (login y datos de usuario)

1. En Firebase Console activa **Authentication → Correo/contraseña** y **Google**, y crea **Firestore**.
2. Copia `.env.example` a `.env.local` y llena los valores de tu app web. Sin esto la app corre en modo de prueba: partidos de `lib/mocks` y login desactivado.
3. Publica las reglas: `npx firebase-tools deploy --only firestore:rules`.

La estructura de la base de datos está documentada al inicio de `firestore.rules`.
Código en `src/lib/firebase/` (`auth.js`, `db.js`, `useUser.js`); pantalla de login en `/entrar`.

## Dependencias
| Paquete | Tipo | Para qué |
|---|---|---|
| `next` | runtime | framework, rutas, `next/font`, caché de `fetch` |
| `react`, `react-dom` | runtime | UI |
| `firebase` | runtime | login (correo + Google) y Firestore |
| `tailwindcss`, `@tailwindcss/postcss` | dev | estilos (utilidades) |
| `shadcn`, `radix-ui`, `class-variance-authority`, `cn`, `tw-animate-css` | runtime | base de componentes shadcn/ui |
| `@animate-ui/react`, `motion` | runtime | animaciones de los componentes (Animate UI) |
| `lucide-react` | runtime | iconos |
| `eslint`, `eslint-config-next` | dev | `npm run lint` |

Sin librerías extra a propósito: los datos de la API se piden con `fetch` nativo desde el servidor
(route handlers / server components) usando la caché de Next (`revalidate`), así la API key nunca llega al navegador.
Rutas: `/` (Inicio), `/partidos`, `/ligas`, `/ligas/[id]`, `/mi-equipo`, `/partido/[id]`, `/notificaciones`, `/perfil` y `/entrar`.
Pantallas de estado: `app/loading.js` (skeleton), `app/error.js`, `app/global-error.js` y `app/not-found.js` (404).

## Estructura
```text
src/
  styles/globals.css  ← TODO el tema: colores (variables shadcn + propias), radios, tamaños de texto, breakpoints
  theme/fonts.js      familias tipográficas (next/font)
  config/
    site.js           nombre de la app, descripción, colores PWA
    navigation.js     menú, filtros, "siguiendo"
  app/                rutas (layout, manifest, páginas)
  components/
    ui/               shadcn/ui (button, tabs, toggle-group, badge, progress, input, label…) + átomos propios (logo, media, team-crest…)
    layout/           app-shell, sidebar, bottom-nav, top-bar
    match/            componentes de fútbol (featured-match, match-list, match-tabs, scoreboard…)
    pwa/              install-card, service-worker
    league/           standings-table (tabla de posiciones y forma)
    auth/             login-form (entrar, registro, recuperar contraseña), profile-card (perfil y cerrar sesión)
    notifications/    bandeja de avisos y ajustes (push + preferencias)
  lib/
    api/matches.js    capa de datos (cámbiala por tu API)
    firebase/         auth, Firestore, useUser
    mocks/            datos de ejemplo
    push.js           Web Push en el navegador (suscribir, probar, desactivar)
    utils.js          cn() para unir clases
public/sw.js          service worker (red primero, cache de respaldo)
```

## Convenciones

- Una sola base: Tailwind + shadcn/ui. Sin CSS Modules.
- Un componente = un archivo en kebab-case con export con nombre: `import { Button } from '@/components/ui/button'`.
- Componentes nuevos de shadcn: `npx shadcn@latest add <nombre>` y luego `npx @animate-ui/cli@latest animate all` para animarlos.
- Iconos: usa los **animados** de `src/components/animate-ui/icons/` (Animate UI). Para agregar uno: `npx shadcn@latest add https://animate-ui.com/r/icons-lucide-<nombre>.json`. Solo si no existe animado, usa `lucide-react`.
- Microinteracciones: `Button` y `AnimatedLink` animan solos los iconos de adentro al pasar el cursor o tocar. Para listas usa `ENTER` + `stagger(i)` de `lib/utils.js`. Todo respeta "reducir movimiento" del sistema.
- No uses `npx shadcn add ... -o`: sobrescribe componentes ya personalizados (por ejemplo `button.jsx`).
- `'use client'` solo donde hay estado o eventos del navegador.
- Colores siempre con las clases del tema (`bg-card`, `text-primary`, `text-live`…), nunca hex sueltos en componentes.

## Tema

La app es solo oscura (`<html class="dark">`). Colores principales en `globals.css`:

| Variable | Uso | Clase |
|---|---|---|
| `--primary` | verde lima de la marca | `bg-primary`, `text-primary` |
| `--background` / `--card` / `--secondary` / `--accent` | fondo y superficies 1, 2, 3 | `bg-background`, `bg-card`… |
| `--muted-foreground` / `--subtle` / `--faint` | textos secundarios | `text-muted-foreground`, `text-subtle`, `text-faint` |
| `--live` | rojo "en vivo" | `bg-live`, `text-live` |

Para cambiar la marca: edita `--primary` en `globals.css`, la fuente en `fonts.js` y el nombre en `config/site.js`.

Breakpoints: `md` = 768px (tablet) y `xl` = 1200px (escritorio).

## Notificaciones

- **Web y celular:** `/notificaciones` tiene la bandeja de avisos y los ajustes (qué avisos recibir).
- **Push:** en el celular (y en Chrome de escritorio) se activan desde Ajustes. Usa Web Push estándar:
  `public/sw.js` recibe el aviso y `app/api/push/test` envía uno de prueba.
- **iPhone:** solo iOS 16.4+ y **con la app instalada** (Compartir → Agregar a inicio, abrir desde el ícono).
- **Claves:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT` en `.env.local`
  (genéralas con `npx web-push generate-vapid-keys`). La privada nunca va al navegador.
- **Para probar en el celular** hace falta HTTPS: un deploy de prueba o un túnel (`cloudflared`, `ngrok`).

## PWA
- `app/manifest.js` genera `/manifest.webmanifest`.
- Agrega `public/icons/icon-192.png` e `icon-512.png`.
- El service worker solo se registra en producción (`npm run build && npm start`).
