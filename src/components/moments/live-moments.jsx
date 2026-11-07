'use client';

import { useEffect, useRef, useState } from 'react';
import { useMoments } from './moments-provider';
import { pendingMoments } from '@/lib/moments/map-event.mjs';

/**
 * Animaciones del partido:
 *  - Al entrar: los eventos que ya pasaron (goles, tarjetas, VAR) en cadena, uno por uno, en orden; y el final si terminó.
 *  - En vivo: cada evento nuevo al llegar (la página se actualiza sola).
 *  - Lo ya visto en esta sesión no se repite al volver al partido (remember).
 *  - Si el usuario apagó las animaciones en su perfil, no se muestra nada.
 */
export function LiveMoments({ match, remember = true }) {
  const { play, clear, enabled } = useMoments();
  const seen = useRef(null);
  const [left, setLeft] = useState(0);
  const storeKey = `minuto90:moments:${match?.id}`;

  useEffect(() => {
    if (enabled === null || !match) return; // aún no se sabe la preferencia del usuario
    if (seen.current === null) {
      let stored = [];
      if (remember) { try { stored = JSON.parse(sessionStorage.getItem(storeKey) || '[]'); } catch { /* sin almacenamiento */ } }
      seen.current = new Set(stored);
    }
    const { moments, keys } = pendingMoments(match, seen.current);
    seen.current = keys;
    if (remember) { try { sessionStorage.setItem(storeKey, JSON.stringify([...keys])); } catch { /* modo privado */ } }
    if (!enabled || !moments.length) return;

    setLeft((n) => n + moments.length);
    for (const m of moments) {
      play(m.type, m.data, { priority: m.type === 'lastMinuteGoal' && moments.length === 1 })
        .finally(() => setLeft((n) => Math.max(0, n - 1)));
    }
  }, [match, enabled, play, remember, storeKey]);

  if (left < 2) return null;
  return (
    <button
      type="button"
      onClick={() => clear()}
      // Por encima de la capa de animaciones (que usa casi el z-index máximo).
      style={{ zIndex: 2147483647 }}
      className="fixed top-[calc(16px+env(safe-area-inset-top))] right-4 rounded-full bg-background/80 px-4 py-2 text-sm font-bold text-foreground shadow-lg ring-1 ring-border backdrop-blur animate-in fade-in-0 duration-300"
    >
      Saltar animaciones ({left})
    </button>
  );
}
