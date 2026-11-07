import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { FreshData } from '@/components/layout/fresh-data';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { MatchClock } from '@/components/match/match-clock';
import { LiveMoments } from '@/components/moments/live-moments';
import { PlayToasts } from '@/components/moments/play-toasts';
import { SoundToggle } from '@/components/moments/sound-toggle';
import { CreateRoomButton } from '@/components/rooms/create-room-button';
import { Scoreboard } from '@/components/match/scoreboard';
import { MatchVote } from '@/components/match/match-vote';
import { MatchTabs } from '@/components/match/match-tabs';
import { getMatch, getLiveCount, getDataTime } from '@/lib/api/matches';
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
      <FreshData fetchedAt={await getDataTime()} />
      <AutoRefresh enabled={match.status === 'live'} seconds={20} />
      <div className="flex flex-col gap-5">
        <LiveMoments match={match} />
        <PlayToasts match={match} />
        <div className="flex items-center justify-between gap-3">
          <Link href={`/ligas/${match.leagueId}`} className="text-sm font-medium text-subtle">← {match.league}{match.round && ` · ${match.round}`}</Link>
          <span className="flex items-center gap-2">
            <CreateRoomButton match={match} />
            {match.status !== 'finished' && <SoundToggle />}
          </span>
        </div>
        <MatchClock match={match} />
        <Scoreboard match={match} />
        <MatchVote match={{ id: match.id, status: match.status, utc: match.utc, home: match.home, away: match.away }} />
      </div>
    </AppShell>
  );
}
