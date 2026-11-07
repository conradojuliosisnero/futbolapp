import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { MatchClock } from '@/components/match/match-clock';
import { Scoreboard } from '@/components/match/scoreboard';
import { PredictionBar } from '@/components/match/prediction-bar';
import { MatchTabs } from '@/components/match/match-tabs';
import { getMatch, getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const m = await getMatch(id);
  if (!m) return {};
  const result = m.score ? `${m.score[0]}–${m.score[1]}` : 'vs';
  return { title: `${m.home.name} ${result} ${m.away.name} · ${siteConfig.name}` };
}

export default async function MatchPage({ params }) {
  const { id } = await params;
  const [match, liveCount] = await Promise.all([getMatch(id, { details: true }), getLiveCount()]);
  if (!match) notFound();

  return (
    <AppShell active="en-vivo" counts={{ live: liveCount }} aside={<MatchTabs match={match} />} asideWide>
      <AutoRefresh enabled={match.status === 'live'} />
      <div className="flex flex-col gap-5">
        <Link href={`/ligas/${match.leagueId}`} className="text-sm font-medium text-subtle">← {match.league}{match.round && ` · ${match.round}`}</Link>
        <MatchClock match={match} />
        <Scoreboard match={match} />
        {match.prediction && <PredictionBar match={match} />}
      </div>
    </AppShell>
  );
}
