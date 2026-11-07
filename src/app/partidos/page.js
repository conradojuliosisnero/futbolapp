import { AppShell } from '@/components/layout/app-shell';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { SectionTabs } from '@/components/ui/section-tabs';
import { MatchGroups } from '@/components/match/match-groups';
import { getMatchesByStatus, getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Partidos · ${siteConfig.name}` };

const count = (groups) => groups.reduce((n, g) => n + g.matches.length, 0);

export default async function MatchesPage() {
  const [{ live, scheduled, finished }, liveCount] = await Promise.all([getMatchesByStatus(), getLiveCount()]);

  return (
    <AppShell active="partidos" counts={{ live: liveCount }}>
      <AutoRefresh enabled={liveCount > 0} />
      <div className="flex max-w-3xl flex-col gap-5">
        <h1 className="text-[26px] font-black tracking-tight">Partidos</h1>
        <SectionTabs
          label="Estado de los partidos"
          defaultValue={live.length ? 'live' : 'scheduled'}
          items={[
            { value: 'live', label: `En vivo · ${count(live)}`, content: <MatchGroups groups={live} empty="No hay partidos en vivo ahora." /> },
            { value: 'scheduled', label: `Próximos · ${count(scheduled)}`, content: <MatchGroups groups={scheduled} empty="No hay partidos programados." /> },
            { value: 'finished', label: 'Finalizados', content: <MatchGroups groups={finished} empty="Aún no hay resultados." /> },
          ]}
        />
      </div>
    </AppShell>
  );
}
