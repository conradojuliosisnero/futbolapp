import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { SectionTabs } from '@/components/ui/section-tabs';
import { StandingsTable } from '@/components/league/standings-table';
import { MatchRow } from '@/components/match/match-list';
import { getLeague, getLiveCount } from '@/lib/api/matches';
import { FOLLOWING } from '@/config/navigation';
import { siteConfig } from '@/config/site';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const league = await getLeague(id);
  return league ? { title: `${league.name} · ${siteConfig.name}` } : {};
}

export default async function LeaguePage({ params }) {
  const { id } = await params;
  const [league, liveCount] = await Promise.all([getLeague(id), getLiveCount()]);
  if (!league) notFound();
  const myTeam = FOLLOWING.find((f) => f.type === 'team')?.code;

  return (
    <AppShell active="ligas" counts={{ live: liveCount }}>
      <div className="flex max-w-3xl flex-col gap-5">
        <Link href="/ligas" className="text-sm font-medium text-subtle">← Ligas</Link>
        <header className="flex items-center gap-4">
          <span className="grid size-14 flex-none place-items-center rounded-full bg-neutral-1 font-black">{league.short}</span>
          <div className="flex flex-col gap-1">
            <h1 className="text-[26px] leading-none font-black tracking-tight">{league.name}</h1>
            <span className="text-md text-muted-foreground">Temporada {league.season} · {league.round}</span>
          </div>
        </header>
        <SectionTabs
          label="Secciones de la liga"
          items={[
            { value: 'table', label: 'Tabla', content: <StandingsTable rows={league.standings} highlight={myTeam} /> },
            {
              value: 'matches',
              label: 'Partidos',
              content: (
                <div className="flex flex-col gap-2">
                  {league.matches.map((m, i) => <MatchRow key={m.id} match={m} index={i} />)}
                </div>
              ),
            },
          ]}
        />
      </div>
    </AppShell>
  );
}
