'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';
import { useUserDoc } from '@/lib/firebase/useUserDoc';
import { currentStreak, todayOf, POINTS, NEWS_PER_DAY } from '@/lib/game/rules.mjs';
import { cn } from '@/lib/utils';

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Mi racha, mis puntos y cómo ganar más. */
export function MyGameCard() {
  const { user, profile } = useUserDoc();
  if (user === undefined || (user && profile === undefined)) return <div className="h-48 animate-pulse rounded-3xl bg-card" />;
  if (!user) {
    return (
      <div className="flex flex-col gap-3 rounded-3xl bg-card p-5">
        <p className="font-bold">Entra para sumar puntos y mantener tu racha.</p>
        <Link href="/entrar?siguiente=/ranking" className="w-fit rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Entrar</Link>
      </div>
    );
  }
  const game = profile?.game ?? {};
  const streak = currentStreak(game);
  const inWeek = streak === 0 ? 0 : streak % 7 || 7;
  const t = todayOf(game);
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-card p-5">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame aria-hidden className={cn('size-9', streak ? 'fill-orange-500 text-orange-400' : 'text-faint')} />
          <span className="text-4xl font-black tabular-nums">{streak}</span>
          <span className="text-sm font-semibold text-muted-foreground">{streak === 1 ? 'día seguido' : 'días seguidos'}</span>
        </div>
        <span className="text-right text-sm text-muted-foreground">
          <b className="block text-2xl font-black text-foreground tabular-nums">{game.points ?? 0}</b>puntos
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5" aria-label={`${7 - inWeek} días para el bono semanal`}>
        {DAYS.map((d, i) => (
          <span key={i} className={cn('grid h-9 place-items-center rounded-xl text-xs font-bold', i < inWeek ? 'bg-primary text-primary-foreground' : 'bg-secondary text-subtle')}>{d}</span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {inWeek === 7 ? `¡Semana completa! +${POINTS.week} pts de bono.` : `${7 - inWeek} días más para el bono de +${POINTS.week} pts.`}
        {' '}Mejor racha: {game.best ?? 0} · Hoy: {t.today} pts
      </p>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        <li className="rounded-2xl bg-secondary px-3 py-2"><b>+{POINTS.day}</b> entrar cada día</li>
        <li className="rounded-2xl bg-secondary px-3 py-2"><b>+{POINTS.news}</b> por noticia leída ({t.news}/{NEWS_PER_DAY} hoy)</li>
        <li className="rounded-2xl bg-secondary px-3 py-2"><b>+{POINTS.vote}</b> votar quién gana un partido</li>
        <li className="rounded-2xl bg-secondary px-3 py-2"><b>+{POINTS.correct}</b> si aciertas el ganador</li>
      </ul>
    </div>
  );
}
