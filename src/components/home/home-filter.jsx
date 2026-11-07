'use client';

import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { MatchList } from '@/components/match/match-list';
import { MyLeaguesNote } from '@/components/match/my-leagues-note';
import { FollowLeagueButton } from '@/components/league/follow-league-button';
import { useFollowedLeagues, onlyFollowed } from '@/lib/firebase/useFollowedLeagues';

// Filtro del inicio (En vivo / Hoy / Mañana / Ligas): lo cambian las pestañas de TopBar y lo lee HomeMatches.
const HomeFilterContext = createContext(null);
export const useHomeFilter = () => useContext(HomeFilterContext);

export function HomeFilterProvider({ initial = 'today', children }) {
  const [filter, setFilter] = useState(initial);
  return <HomeFilterContext.Provider value={{ filter, setFilter }}>{children}</HomeFilterContext.Provider>;
}

const EMPTY = {
  live: 'No hay partidos en vivo ahora.',
  today: 'Hoy no hay partidos.',
  tomorrow: 'Mañana no hay partidos.',
};
const TITLE = { live: 'En vivo', today: 'Partidos de hoy', tomorrow: 'Partidos de mañana' };

/**
 * Lista del inicio según la pestaña elegida. lists: { live, today, tomorrow } (grupos por liga);
 * leagues: [{ code, name, emblem, live, total }]; dates: { today, tomorrow } (etiquetas).
 */
export function HomeMatches({ lists, leagues, dates, highlightId }) {
  const { filter } = useHomeFilter();
  const { followed } = useFollowedLeagues();

  if (filter === 'leagues') {
    const sorted = followed ? [...leagues].sort((a, b) => followed.has(b.code) - followed.has(a.code)) : leagues;
    return (
      <section className="flex flex-col gap-2" key="leagues">
        <h2 className="mb-2 text-lg font-extrabold">Ligas</h2>
        {sorted.map((l) => (
          <div key={l.code} className="flex items-center gap-3 rounded-2xl bg-card p-3">
            <Link href={`/ligas/${l.code}`} className="flex min-w-0 flex-1 items-center gap-3 hover:text-inherit">
              {/* eslint-disable-next-line @next/next/no-img-element -- escudo externo */}
              <span className="grid size-9 flex-none place-items-center rounded-full bg-white p-1.5"><img src={l.emblem} alt="" className="size-full object-contain" /></span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold">{l.name}</span>
                <span className="text-xs text-muted-foreground">{l.live ? `${l.live} en vivo · ` : ''}{l.total} esta semana</span>
              </span>
            </Link>
            <FollowLeagueButton league={l} className="px-2.5 py-1 text-xs" />
          </div>
        ))}
      </section>
    );
  }

  const groups = onlyFollowed(lists[filter] ?? [], followed);
  return (
    <div className="flex flex-col gap-3" key={filter}>
      <MyLeaguesNote followed={followed} />
      {groups.length
        ? <MatchList title={TITLE[filter]} date={dates[filter]} groups={groups} highlightId={highlightId} />
        : <p className="py-4 text-muted-foreground">{EMPTY[filter]}{followed && ' (en tus ligas)'}</p>}
    </div>
  );
}
