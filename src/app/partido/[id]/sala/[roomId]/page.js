import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { FreshData } from '@/components/layout/fresh-data';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { MatchClock } from '@/components/match/match-clock';
import { Scoreboard } from '@/components/match/scoreboard';
import { MatchTabs } from '@/components/match/match-tabs';
import { LiveMoments } from '@/components/moments/live-moments';
import { SoundToggle } from '@/components/moments/sound-toggle';
import { RoomView } from '@/components/rooms/room-view';
import { getMatch, getLiveCount, getDataTime } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const m = await getMatch(id);
  return m ? { title: `Sala · ${m.home.name} vs ${m.away.name} · ${siteConfig.name}`, robots: { index: false } } : {};
}

/** Sala para ver el partido con amigos: mismo marcador y animaciones de los momentos + chat. */
export default async function RoomPage({ params }) {
  const { id, roomId } = await params;
  if (!/^[A-Za-z0-9]{10,40}$/.test(roomId)) notFound();
  const [match, liveCount] = await Promise.all([getMatch(id, { details: true }), getLiveCount()]);
  if (!match) notFound();

  return (
    <AppShell active="en-vivo" counts={{ live: liveCount }} aside={<MatchTabs match={match} />} asideWide>
      <FreshData fetchedAt={await getDataTime()} />
      <AutoRefresh enabled={match.status === 'live'} />
      <div className="flex flex-col gap-4">
        <LiveMoments match={match} />
        <div className="flex items-center justify-between gap-3">
          <Link href={`/partido/${match.id}`} className="text-sm font-medium text-subtle">← Partido</Link>
          {match.status !== 'finished' && <SoundToggle />}
        </div>
        <Scoreboard match={match} />
        <MatchClock match={match} />
        <RoomView roomId={roomId} matchId={match.id} />
      </div>
    </AppShell>
  );
}
