import { AppShell, TopBar } from '@/components/layout';
import { FeaturedMatch, HighlightsGrid, MatchList } from '@/components/match';
import { Stack } from '@/components/ui';
import { getFeaturedMatch, getHighlights, getTodayByLeague, getLiveCount } from '@/lib/api/matches';

export default async function HomePage() {
  const [featured, highlights, groups, liveCount] = await Promise.all([
    getFeaturedMatch(), getHighlights(), getTodayByLeague(), getLiveCount(),
  ]);

  return (
    <AppShell
      active="inicio"
      counts={{ live: liveCount }}
      aside={<MatchList title="Partidos de hoy" date="Vie 6 nov" groups={groups} highlightId={featured.id} />}
    >
      <TopBar liveCount={liveCount} />
      <Stack gap={7}>
        <FeaturedMatch match={featured} />
        <HighlightsGrid title="Resúmenes y goles" items={highlights} />
      </Stack>
    </AppShell>
  );
}
