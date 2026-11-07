import { CalendarDays } from '@/components/animate-ui/icons/calendar-days';
import { AppShell } from '@/components/layout/app-shell';
import { FreshData } from '@/components/layout/fresh-data';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { TopBar } from '@/components/layout/top-bar';
import { FeaturedMatch } from '@/components/match/featured-match';
import { SectionHeader } from '@/components/ui/section-header';
import { NewsList } from '@/components/news/news-list';
import { StatusScreen } from '@/components/ui/status-screen';
import { HomeFilterProvider, HomeMatches } from '@/components/home/home-filter';
import { getFeaturedMatch, getNews, getHomeLists, getLeagues, getLiveCount, todayLabel, getDataTime } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

const tomorrowLabel = () => new Intl.DateTimeFormat('es', { timeZone: siteConfig.timeZone, weekday: 'short', day: 'numeric', month: 'short' }).format(Date.now() + 86_400_000);

export default async function HomePage() {
  const [featured, news, lists, leagues, liveCount] = await Promise.all([
    getFeaturedMatch(), getNews(), getHomeLists(), getLeagues(), getLiveCount(),
  ]);
  const matches = (
    <HomeMatches
      lists={lists}
      leagues={leagues.map((l) => ({ code: l.code, name: l.name, emblem: l.emblem, live: l.live, total: l.total }))}
      dates={{ today: todayLabel(), tomorrow: tomorrowLabel() }}
      highlightId={featured?.id}
    />
  );

  return (
    // Las pestañas (TopBar) y la lista (HomeMatches) comparten el filtro. En escritorio grande la lista va
    // en la columna derecha; en celular y tablet, justo debajo de las pestañas.
    <HomeFilterProvider initial={liveCount > 0 ? 'live' : 'today'}>
      <AppShell
        active="inicio"
        counts={{ live: liveCount }}
        aside={<div className="hidden xl:block">{matches}</div>}
      >
        <FreshData fetchedAt={await getDataTime()} />
        <AutoRefresh enabled={liveCount > 0} />
        <TopBar liveCount={liveCount} />
        <div className="flex flex-col gap-7">
          <div className="xl:hidden">{matches}</div>
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
    </HomeFilterProvider>
  );
}
