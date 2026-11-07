import { CalendarDays } from '@/components/animate-ui/icons/calendar-days';
import { AppShell } from '@/components/layout/app-shell';
import { FreshData } from '@/components/layout/fresh-data';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { TopBar } from '@/components/layout/top-bar';
import { FeaturedMatch } from '@/components/match/featured-match';
import { SectionHeader } from '@/components/ui/section-header';
import { NewsList } from '@/components/news/news-list';
import { MatchList } from '@/components/match/match-list';
import { StatusScreen } from '@/components/ui/status-screen';
import { getFeaturedMatch, getNews, getTodayByLeague, getLiveCount, todayLabel, getDataTime } from '@/lib/api/matches';

export default async function HomePage() {
  const [featured, news, groups, liveCount] = await Promise.all([
    getFeaturedMatch(), getNews(), getTodayByLeague(), getLiveCount(),
  ]);

  return (
    <AppShell
      active="inicio"
      counts={{ live: liveCount }}
      aside={groups.length
        ? <MatchList title="Partidos de hoy" date={todayLabel()} groups={groups} highlightId={featured?.id} />
        : <p className="text-muted-foreground">Hoy no hay partidos en tus ligas.</p>}
    >
      <FreshData fetchedAt={await getDataTime()} />
      <AutoRefresh enabled={liveCount > 0} />
      <TopBar liveCount={liveCount} />
      <div className="flex flex-col gap-7">
        {featured
          ? <FeaturedMatch match={featured} />
          : <StatusScreen icon={CalendarDays} title="Sin partidos" text="No hay partidos esta semana en las ligas configuradas." />}
        {news.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionHeader title="Noticias" action={{ href: '/noticias', label: 'Ver todas' }} />
            <NewsList items={news.slice(0, 5)} />
          </section>
        )}
      </div>
    </AppShell>
  );
}
