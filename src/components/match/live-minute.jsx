'use client';

import { useEffect, useState } from 'react';
import { liveMinute } from '@/lib/api/live-clock.mjs';

/**
 * Minuto en vivo que avanza solo (cada segundo se recalcula; cambia al pasar el minuto).
 * clock: match.liveClock ({ minute, seconds, period, at }); fallback: el minuto que vino del servidor.
 */
export function LiveMinute({ clock, fallback, className }) {
  const [now, setNow] = useState(null); // null hasta hidratar: el servidor y el navegador muestran lo mismo
  useEffect(() => {
    if (!clock) return undefined;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [clock]);
  const text = clock && now ? liveMinute(clock, now) : fallback;
  return <span key={text} className={className}>{text}</span>;
}
