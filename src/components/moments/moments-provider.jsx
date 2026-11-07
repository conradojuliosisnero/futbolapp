'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const MomentsContext = createContext(null);
const MUTE_KEY = 'minuto90:moments-muted';

// Colores del tema "Estadio nocturno" (mismos valores que globals.css) y la fuente de la app.
const THEME = {
  bg: '#0c0d0c', surface: '#151714', text: '#f1f2ee', textMuted: '#9a9d93', accent: '#c6f432', accentContrast: '#0c0d0c',
  live: '#e8332b', yellow: '#f2c230',
  fontSans: 'var(--font-archivo), Helvetica, Arial, sans-serif', fontMono: 'var(--font-jetbrains), ui-monospace, monospace',
};

/**
 * Capa de animaciones de momentos clave (gol, tarjetas, VAR, final) por encima de toda la app.
 * GSAP y anime.js se descargan solo en el navegador, al montarse (no pesan en el resto de la app).
 */
export function MomentsProvider({ children, variant = 'full' }) {
  const engine = useRef(null);
  const pending = useRef([]);
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    let alive = true;
    let initialMuted = false;
    try { initialMuted = localStorage.getItem(MUTE_KEY) === '1'; } catch { /* sin almacenamiento */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencia guardada en el dispositivo, solo tras hidratar
    setMutedState(initialMuted);
    Promise.all([import('gsap'), import('animejs'), import('@/lib/moments/engine')]).then(([g, a, { createMoments }]) => {
      if (!alive) return;
      engine.current = createMoments({
        gsap: g.gsap ?? g.default, anime: a.default ?? a, theme: THEME, variant, haptics: true, sound: true, volume: 0.8, muted: initialMuted,
      });
      pending.current.splice(0).forEach(([type, data, opts]) => engine.current.play(type, data, opts));
    });
    return () => { alive = false; engine.current?.destroy(); engine.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el motor se crea una sola vez
  }, []);

  const play = useCallback((type, data, opts) => {
    if (engine.current) return engine.current.play(type, data, opts);
    pending.current.push([type, data, opts]);
    return Promise.resolve(false);
  }, []);
  const skip = useCallback(() => engine.current?.skip(), []);
  const clear = useCallback(() => engine.current?.clear(), []);
  const setVariant = useCallback((v) => engine.current?.setVariant(v), []);
  const setMuted = useCallback((m) => {
    setMutedState(m);
    engine.current?.setMuted(m);
    try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* modo privado */ }
  }, []);

  const value = useMemo(() => ({ play, skip, clear, setVariant, muted, setMuted }), [play, skip, clear, setVariant, muted, setMuted]);
  return <MomentsContext.Provider value={value}>{children}</MomentsContext.Provider>;
}

export function useMoments() {
  const ctx = useContext(MomentsContext);
  if (!ctx) throw new Error('useMoments debe usarse dentro de <MomentsProvider>');
  return ctx;
}
