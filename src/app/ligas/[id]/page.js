import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { FreshData } from '@/components/layout/fresh-data';
import { SectionTabs } from '@/components/ui/section-tabs';
import { StandingsTable } from '@/components/league/standings-table';
import { ScorersTable } from '@/components/league/scorers-table';
import { MatchRow } from '@/components/match/match-list';
import { getLeague, getLiveCount, getDataTime } from '@/lib/api/matches';
import { DEFAULT_TEAM } from '@/config/leagues';
import { siteConfig } from '@/config/site';
import { FollowLeagueButton } from '@/components/league/follow-league-button';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const league = await getLeague(id);
  return league ? { title: `${league.name} · ${siteConfig.name}` } : {};
}

export default async function LeaguePage({ params }) {
  const { id } = await params;
  const [league, liveCount] = await Promise.all([getLeague(id), getLiveCount()]);
  if (!league) notFound();

  const table = league.groups.length ? (
    <div className="flex flex-col gap-4">
      {league.groups.map((g, i) => (
        <div key={g.name ?? i} className="flex flex-col gap-2">
          {g.name && <h3 className="text-xs font-semibold tracking-wider text-faint uppercase">{g.name}</h3>}
          <StandingsTable rows={g.rows} highlight={DEFAULT_TEAM.id} />
        </div>
      ))}
    </div>
  ) : <p className="py-6 text-center text-muted-foreground">Esta competición no tiene tabla en esta fase.</p>;

  const matches = league.matches.length
    ? <div className="flex flex-col gap-2">{league.matches.map((m, i) => <MatchRow key={m.id} match={m} index={i} />)}</div>
    : <p className="py-6 text-center text-muted-foreground">No hay partidos esta semana.</p>;

  return (
    <AppShell active="ligas" counts={{ live: liveCount }}>
      <FreshData fetchedAt={await getDataTime()} />
      <div className="flex max-w-3xl flex-col gap-5">
        <Link href="/ligas" className="text-sm font-medium text-subtle">← Ligas</Link>
        <header className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- escudo de la API externa */}
          <span className="grid size-14 flex-none place-items-center rounded-full bg-white p-2.5"><img src={league.emblem} alt="" className="size-full object-contain" /></span>
          <div className="flex flex-col gap-1">
            <h1 className="text-[26px] leading-none font-black tracking-tight">{league.name}</h1>
            <span className="text-md text-muted-foreground">{[league.country, league.season && `Temporada ${league.season}`, league.round].filter(Boolean).join(' · ')}</span>
          </div>
          <FollowLeagueButton league={{ code: league.code, name: league.name, emblem: league.emblem }} className="ml-auto" />
        </header>
        <SectionTabs
          label="Secciones de la liga"
          defaultValue={league.groups.length ? 'table' : 'matches'}
          items={[
            { value: 'table', label: 'Tabla', content: table },
            { value: 'matches', label: 'Partidos', content: matches },
            { value: 'scorers', label: 'Goleadores', content: <ScorersTable rows={league.scorers} /> },
          ]}
        />
      </div>
    </AppShell>
  );
}
