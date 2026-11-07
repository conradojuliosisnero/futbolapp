import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { VideoPlayer, Scoreboard, PredictionBar, MatchTabs } from '@/components/match';
import { BackLink, Stack } from '@/components/ui';
import { getMatch, getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const m = await getMatch(id);
  if (!m) return {};
  return { title: `${m.home.name} ${m.score[0]}–${m.score[1]} ${m.away.name} · ${siteConfig.name}` };
}

export default async function MatchPage({ params }) {
  const { id } = await params;
  const [match, liveCount] = await Promise.all([getMatch(id), getLiveCount()]);
  if (!match) notFound();

  return (
    <AppShell active="en-vivo" counts={{ live: liveCount }} aside={<MatchTabs match={match} />} asideWide>
      <Stack gap={5}>
        <BackLink href="/">{match.league} · {match.round}</BackLink>
        <VideoPlayer live={match.status === 'live'} progress={match.progress} />
        <Scoreboard match={match} />
        {match.prediction && <PredictionBar match={match} />}
      </Stack>
    </AppShell>
  );
}
