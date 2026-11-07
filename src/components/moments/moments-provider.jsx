'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useUserDoc } from '@/lib/firebase/useUserDoc';
import { saveAnimationsPref } from '@/lib/firebase/db';

const MomentsContext = createContext(null);
const MUTE_KEY = 'minuto90:moments-muted';
const ENABLED_KEY = 'minuto90:animations'; // '0' = apagadas; por defecto, encendidas

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
  // null = aún no se sabe (antes de hidratar); luego true/false. Por defecto, encendidas.
  const [enabled, setEnabledState] = useState(null);
  const { user, profile } = useUserDoc();

  useEffect(() => {
    let alive = true;
    const queue = pending.current; // misma lista durante toda la vida del proveedor
    let initialMuted = false;
    try { initialMuted = localStorage.getItem(MUTE_KEY) === '1'; } catch { /* sin almacenamiento */ }
    let initialEnabled = true;
    try { initialEnabled = localStorage.getItem(ENABLED_KEY) !== '0'; } catch { /* sin almacenamiento */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencias guardadas en el dispositivo, solo tras hidratar
    setMutedState(initialMuted);
    setEnabledState(initialEnabled);
    Promise.all([import('gsap'), import('animejs'), import('@/lib/moments/engine')]).then(([g, a, { createMoments }]) => {
      if (!alive) return;
      engine.current = createMoments({
        gsap: g.gsap ?? g.default, anime: a.default ?? a, theme: THEME, variant, haptics: true, sound: true, volume: 0.8, muted: initialMuted,
      });
      // Lo pedido antes de que cargara el motor se reproduce ahora; su promesa se resuelve al terminar cada animación.
      pending.current.splice(0).forEach(([type, data, opts, resolve]) => engine.current.play(type, data, opts).then(resolve));
    });
    return () => {
      alive = false;
      queue.splice(0).forEach(([, , , resolve]) => resolve(false));
      engine.current?.destroy(); engine.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el motor se crea una sola vez
  }, []);

  const play = useCallback((type, data, opts) => {
    if (engine.current) return engine.current.play(type, data, opts);
    return new Promise((resolve) => pending.current.push([type, data, opts, resolve]));
  }, []);
  const skip = useCallback(() => engine.current?.skip(), []);
  const clear = useCallback(() => {
    pending.current.splice(0).forEach(([, , , resolve]) => resolve(false));
    engine.current?.clear();
  }, []);
  const setVariant = useCallback((v) => engine.current?.setVariant(v), []);
  const setMuted = useCallback((m) => {
    setMutedState(m);
    engine.current?.setMuted(m);
    try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* modo privado */ }
  }, []);

  // Con sesión manda lo guardado en la cuenta (sigue al usuario entre dispositivos).
  useEffect(() => {
    if (typeof profile?.animations !== 'boolean') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- se sincroniza con Firestore al llegar el documento
    setEnabledState(profile.animations);
    try { localStorage.setItem(ENABLED_KEY, profile.animations ? '1' : '0'); } catch { /* modo privado */ }
  }, [profile?.animations]);

  const setEnabled = useCallback((v) => {
    setEnabledState(v);
    try { localStorage.setItem(ENABLED_KEY, v ? '1' : '0'); } catch { /* modo privado */ }
    if (!v) engine.current?.clear();
    if (user) saveAnimationsPref(user.uid, v).catch((e) => console.warn('No se guardó la preferencia', e.code ?? e));
  }, [user]);

  const value = useMemo(
    () => ({ play, skip, clear, setVariant, muted, setMuted, enabled, setEnabled }),
    [play, skip, clear, setVariant, muted, setMuted, enabled, setEnabled],
  );
  return <MomentsContext.Provider value={value}>{children}</MomentsContext.Provider>;
}

export function useMoments() {
  const ctx = useContext(MomentsContext);
  if (!ctx) throw new Error('useMoments debe usarse dentro de <MomentsProvider>');
  return ctx;
}
