'use client';

import { useEffect, useState } from 'react';
import { TeamCrest } from '@/components/ui/team-crest';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, ENTER, stagger } from '@/lib/utils';

let cache = null; // la selección rápida cambia poco: una sola descarga por visita

/** Selección rápida: chips de ligas y, debajo, los 10 mejores equipos de la liga elegida. */
export function QuickPicks({ onPick, compact = false }) {
  const [top, setTop] = useState(cache);
  const [league, setLeague] = useState(cache?.[0]?.code ?? null);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    fetch('/api/buscar?top=1').then((r) => r.json()).then(({ top: t = [] }) => {
      cache = t;
      if (alive) { setTop(t); setLeague(t[0]?.code ?? null); }
    }).catch(() => alive && setTop([]));
    return () => { alive = false; };
  }, []);

  if (!top) return <div className="grid grid-cols-2 gap-2 p-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>;
  if (!top.length) return null;
  const current = top.find((l) => l.code === league) ?? top[0];

  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="px-1 text-xs font-semibold tracking-wider text-faint uppercase">Selección rápida · Top 10 por liga</p>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Ligas">
        {top.map((l) => (
          <button
            key={l.code}
            type="button"
            role="tab"
            aria-selected={l.code === current.code}
            onClick={() => setLeague(l.code)}
            className={cn(
              'flex flex-none items-center gap-1.5 rounded-full py-1.5 pr-3 pl-1.5 text-sm font-semibold transition-colors',
              l.code === current.code ? 'bg-primary text-primary-foreground' : 'bg-secondary text-control hover:text-foreground',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- escudo de liga externo */}
            <img src={l.emblem} alt="" className="size-5 rounded-full bg-white object-contain p-0.5" />
            {l.name}
          </button>
        ))}
      </div>
      <div key={current.code} className={cn('grid gap-1.5', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3')}>
        {current.teams.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(`/equipo/${t.id}`)}
            style={stagger(i)}
            className={cn(ENTER, 'flex min-w-0 items-center gap-2.5 rounded-xl bg-secondary/60 px-2.5 py-2 text-left transition-colors hover:bg-secondary active:scale-[0.98]')}
          >
            <span className="w-4 flex-none text-right text-xs font-bold text-faint tabular-nums">{i + 1}</span>
            <TeamCrest team={t} size={24} />
            <span className="truncate text-sm font-semibold">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
