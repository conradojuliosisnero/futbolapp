import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { FreshData } from '@/components/layout/fresh-data';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { TeamView } from '@/components/team/team-view';
import { MyTeamRedirect } from '@/components/team/my-team-redirect';
import { getTeamPage, getTeamNews, getLiveCount, getDataTime } from '@/lib/api/matches';
import { DEFAULT_TEAM } from '@/config/leagues';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Mi equipo · ${siteConfig.name}` };

export default async function MyTeamPage() {
  const [data, liveCount] = await Promise.all([getTeamPage(DEFAULT_TEAM.id), getLiveCount()]);
  return (
    <AppShell active="mi-equipo" counts={{ live: liveCount }}>
      <FreshData fetchedAt={await getDataTime()} />
      <MyTeamRedirect defaultId={DEFAULT_TEAM.id} />
      {data ? (
        <>
          <AutoRefresh enabled={data.live.length > 0} />
          <TeamView
            data={data}
            news={await getTeamNews(data.team.name, data.league?.id)}
            note={(
              <p className="text-center text-xs text-faint">
                Equipo por defecto. Busca tu equipo y toca <b className="text-foreground">Hacer mi equipo</b> (requiere <Link href="/entrar" className="text-primary">iniciar sesión</Link>).
              </p>
            )}
          />
        </>
      ) : <p className="py-10 text-center text-muted-foreground">No pudimos cargar tu equipo.</p>}
    </AppShell>
  );
}
