'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';
import { useUserDoc } from '@/lib/firebase/useUserDoc';
import { currentStreak } from '@/lib/game/rules.mjs';
import { cn } from '@/lib/utils';

/** Racha (llama) y puntos. Lleva al ranking. full = versión de la barra lateral con los puntos. */
export function StreakBadge({ full = false, className }) {
  const { user, profile } = useUserDoc();
  if (!user || !profile) return null;
  const streak = currentStreak(profile.game);
  const points = profile.game?.points ?? 0;
  return (
    <Link
      href="/ranking"
      aria-label={`Racha de ${streak} días · ${points} puntos · ver ranking`}
      data-streak
      className={cn(
        'flex items-center gap-1.5 rounded-full bg-secondary font-bold transition-transform active:scale-95',
        full ? 'h-11 px-3.5 text-sm' : 'h-11 px-3 text-sm',
        className,
      )}
    >
      <Flame aria-hidden className={cn('size-4.5', streak ? 'fill-orange-500 text-orange-400' : 'text-faint')} />
      <span className="tabular-nums">{streak}</span>
      {full && <span className="ml-1 hidden text-xs xl:inline font-semibold text-muted-foreground tabular-nums">{points} pts</span>}
    </Link>
  );
}
