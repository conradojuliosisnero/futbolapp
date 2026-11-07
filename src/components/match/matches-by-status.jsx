'use client';

import { SectionTabs } from '@/components/ui/section-tabs';
import { MatchGroups } from './match-groups';
import { MyLeaguesNote } from './my-leagues-note';
import { useFollowedLeagues, onlyFollowed } from '@/lib/firebase/useFollowedLeagues';

const count = (groups) => groups.reduce((n, g) => n + g.matches.length, 0);

/** Pestañas En vivo / Próximos / Finalizados de /partidos, solo con las ligas que sigue el usuario. */
export function MatchesByStatus({ live, scheduled, finished }) {
  const { followed } = useFollowedLeagues();
  const [l, s, f] = [live, scheduled, finished].map((g) => onlyFollowed(g, followed));
  return (
    <div className="flex flex-col gap-3">
      <MyLeaguesNote followed={followed} />
      <SectionTabs
        label="Estado de los partidos"
        defaultValue={live.length ? 'live' : 'scheduled'}
        items={[
          { value: 'live', label: `En vivo · ${count(l)}`, content: <MatchGroups groups={l} empty="No hay partidos en vivo ahora." /> },
          { value: 'scheduled', label: `Próximos · ${count(s)}`, content: <MatchGroups groups={s} empty="No hay partidos programados." /> },
          { value: 'finished', label: 'Finalizados', content: <MatchGroups groups={f} empty="Aún no hay resultados." /> },
        ]}
      />
    </div>
  );
}
