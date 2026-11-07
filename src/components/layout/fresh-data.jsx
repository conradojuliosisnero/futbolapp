'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * La caché entrega la copia guardada y actualiza en segundo plano: tras un rato sin visitas,
 * el primero en entrar ve datos viejos. Si los datos tienen más de `maxAge` s, recarga una vez a los pocos segundos.
 */
export function FreshData({ fetchedAt, maxAge = 90 }) {
  const router = useRouter();
  useEffect(() => {
    if (!fetchedAt || Date.now() - fetchedAt < maxAge * 1000) return;
    const t = setTimeout(() => router.refresh(), 3000);
    return () => clearTimeout(t);
  }, [fetchedAt, maxAge, router]);
  return null;
}
