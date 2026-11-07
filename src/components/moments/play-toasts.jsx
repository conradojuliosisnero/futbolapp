'use client';

import { useEffect, useRef } from 'react';
import { newPlayToasts } from '@/lib/moments/play-toasts.mjs';
import { toast } from '@/lib/toast';

/**
 * Avisos (toast) de las jugadas del relato en vivo: faltas, fueras de juego, córners, tiros a puerta, cambios…
 * Lo que ya pasó al entrar no se avisa: solo lo que llega mientras miras (la página se actualiza sola).
 */
export function PlayToasts({ match }) {
  const seen = useRef(null);
  useEffect(() => {
    const commentary = match?.commentary ?? [];
    if (seen.current === null) { seen.current = new Set(commentary.map((p) => p.id)); return; }
    const { toasts, seen: next } = newPlayToasts(commentary, seen.current);
    seen.current = next;
    if (match.status === 'live') toasts.forEach((t, i) => setTimeout(() => toast(t), i * 900));
  }, [match]);
  return null;
}
