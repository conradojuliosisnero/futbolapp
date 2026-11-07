import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { AutoRefresh } from '@/components/layout/auto-refresh';
import { TeamView } from '@/components/team/team-view';
import { getTeamPage, getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getTeamPage(id);
  return data ? { title: `${data.team.name} · ${siteConfig.name}` } : {};
}

export default async function TeamPage({ params }) {
  const { id } = await params;
  const [data, liveCount] = await Promise.all([getTeamPage(id), getLiveCount()]);
  if (!data) notFound();
  return (
    <AppShell active="ligas" counts={{ live: liveCount }}>
      <AutoRefresh enabled={data.live.length > 0} />
      <TeamView data={data} />
    </AppShell>
  );
}
