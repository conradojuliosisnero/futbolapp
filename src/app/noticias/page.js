import { AppShell } from '@/components/layout/app-shell';
import { NewsList } from '@/components/news/news-list';
import { LeagueFilter } from '@/components/news/league-filter';
import { getNews, getLiveCount } from '@/lib/api/matches';
import { LEAGUES, leagueByCode } from '@/config/leagues';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Noticias · ${siteConfig.name}` };

export default async function NewsPage({ searchParams }) {
  const { liga } = await searchParams;
  const code = leagueByCode(liga)?.code ?? null; // solo se acepta una liga configurada
  const [items, liveCount] = await Promise.all([getNews(code ?? undefined), getLiveCount()]);
  return (
    <AppShell active="noticias" counts={{ live: liveCount }}>
      <div className="flex max-w-4xl flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-black tracking-tight">Noticias</h1>
          <p className="text-sm text-muted-foreground">Las notas se abren en ESPN.</p>
        </div>
        <LeagueFilter leagues={LEAGUES.map((l) => ({ code: l.code, name: l.name }))} value={code} />
        <NewsList items={items} />
      </div>
    </AppShell>
  );
}
