'use client';

import { useEffect, useState } from 'react';
import { onToast } from '@/lib/toast';
import { onPoints } from '@/lib/game/client';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

const MAX = 3; // visibles a la vez: los más viejos se van

const TONE = {
  default: 'bg-card text-foreground ring-border',
  points: 'bg-primary text-primary-foreground ring-primary',
  warn: 'bg-card text-foreground ring-yellow-400/60',
  danger: 'bg-card text-foreground ring-live/70',
};

/** Pila de avisos arriba al centro (celular) o abajo a la derecha (escritorio). */
export function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const offToast = onToast((t) => {
      setItems((list) => [...list.filter((x) => x.id !== t.id), t].slice(-MAX));
      setTimeout(() => setItems((list) => list.filter((x) => x.id !== t.id)), t.duration);
    });
    // Puntos ganados (racha, noticia, voto) → toast verde.
    const offPoints = onPoints((n, reason) => toast({ tone: 'points', icon: '⚡', title: `+${n} pts`, text: reason, duration: 2600 }));
    return () => { offToast(); offPoints(); };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(12px+env(safe-area-inset-top))] z-[2147483646] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:top-auto md:right-6 md:bottom-6 md:items-end"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          onClick={() => setItems((list) => list.filter((x) => x.id !== t.id))}
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 shadow-xl ring-1 backdrop-blur',
            'animate-in fade-in-0 slide-in-from-top-3 duration-300 md:slide-in-from-bottom-3 motion-reduce:animate-none',
            TONE[t.tone] ?? TONE.default,
          )}
        >
          {t.icon && <span aria-hidden className="text-lg leading-6">{t.icon}</span>}
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-extrabold">{t.title}</span>
            {t.text && <span className={cn('line-clamp-2 text-xs', t.tone === 'points' ? 'opacity-80' : 'text-muted-foreground')}>{t.text}</span>}
          </span>
          {t.min && <span className="ml-auto text-xs font-bold tabular-nums opacity-70">{t.min}</span>}
        </div>
      ))}
    </div>
  );
}
