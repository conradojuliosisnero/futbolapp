import { CalendarDays } from '@/components/animate-ui/icons/calendar-days';
import { AppShell } from '@/components/layout/app-shell';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { TopBar } from '@/components/layout/top-bar';
import { FeaturedMatch } from '@/components/match/featured-match';
import { HighlightsGrid } from '@/components/match/highlights-grid';
import { MatchList } from '@/components/match/match-list';
import { StatusScreen } from '@/components/ui/status-screen';
import { getFeaturedMatch, getHighlights, getTodayByLeague, getLiveCount, todayLabel } from '@/lib/api/matches';

export default async function HomePage() {
  const [featured, highlights, groups, liveCount] = await Promise.all([
    getFeaturedMatch(), getHighlights(), getTodayByLeague(), getLiveCount(),
  ]);

  return (
    <AppShell
      active="inicio"
      counts={{ live: liveCount }}
      aside={groups.length
        ? <MatchList title="Partidos de hoy" date={todayLabel()} groups={groups} highlightId={featured?.id} />
        : <p className="text-muted-foreground">Hoy no hay partidos en tus ligas.</p>}
    >
      <AutoRefresh enabled={liveCount > 0} />
      <TopBar liveCount={liveCount} />
      <div className="flex flex-col gap-7">
        {featured
          ? <FeaturedMatch match={featured} />
          : <StatusScreen icon={CalendarDays} title="Sin partidos" text="No hay partidos esta semana en las ligas configuradas." />}
        {highlights.length > 0 && <HighlightsGrid title="Resúmenes y goles" items={highlights} />}
      </div>
    </AppShell>
  );
}
