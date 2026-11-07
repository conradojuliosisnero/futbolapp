import { AppShell } from '@/components/layout/app-shell';
import { FreshData } from '@/components/layout/fresh-data';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { MatchesByStatus } from '@/components/match/matches-by-status';
import { getMatchesByStatus, getLiveCount, getDataTime } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Partidos · ${siteConfig.name}` };

export default async function MatchesPage() {
  const [{ live, scheduled, finished }, liveCount] = await Promise.all([getMatchesByStatus(), getLiveCount()]);

  return (
    <AppShell active="partidos" counts={{ live: liveCount }}>
      <FreshData fetchedAt={await getDataTime()} />
      <AutoRefresh enabled={liveCount > 0} />
      <div className="flex max-w-3xl flex-col gap-5">
        <h1 className="text-[26px] font-black tracking-tight">Partidos</h1>
        <MatchesByStatus live={live} scheduled={scheduled} finished={finished} />
      </div>
    </AppShell>
  );
}
