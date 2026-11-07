import { AppShell } from '@/components/layout/app-shell';
import { TopBar } from '@/components/layout/top-bar';
import { FeaturedMatch } from '@/components/match/featured-match';
import { HighlightsGrid } from '@/components/match/highlights-grid';
import { MatchList } from '@/components/match/match-list';
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
      <div className="flex flex-col gap-7">
        <FeaturedMatch match={featured} />
        <HighlightsGrid title="Resúmenes y goles" items={highlights} />
      </div>
    </AppShell>
  );
}
