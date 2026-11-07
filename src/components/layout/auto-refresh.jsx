'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Vuelve a pedir la página al servidor cada `seconds` mientras `enabled`. El servidor responde desde caché,
 *  así que no gasta consultas a las APIs por cada usuario. Se pausa si la pestaña no está visible. */
export function AutoRefresh({ enabled = true, seconds = 60 }) {
  const router = useRouter();
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, seconds * 1000);
    return () => clearInterval(id);
  }, [enabled, seconds, router]);
  return null;
}
