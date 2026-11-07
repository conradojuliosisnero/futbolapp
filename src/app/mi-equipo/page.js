import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { TeamView } from '@/components/team/team-view';
import { getTeamPage, getLiveCount } from '@/lib/api/matches';
import { DEFAULT_TEAM } from '@/config/leagues';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Mi equipo · ${siteConfig.name}` };

export default async function MyTeamPage() {
  const [data, liveCount] = await Promise.all([getTeamPage(DEFAULT_TEAM.id), getLiveCount()]);
  return (
    <AppShell active="mi-equipo" counts={{ live: liveCount }}>
      {data ? (
        <>
          <AutoRefresh enabled={data.live.length > 0} />
          <TeamView
            data={data}
            note={(
              <p className="text-center text-xs text-faint">
                Equipo por defecto. Podrás elegir el tuyo al <Link href="/entrar" className="text-primary">iniciar sesión</Link>.
              </p>
            )}
          />
        </>
      ) : <p className="py-10 text-center text-muted-foreground">No pudimos cargar tu equipo.</p>}
    </AppShell>
  );
}
