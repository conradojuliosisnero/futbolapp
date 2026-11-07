import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { LiveBadge } from '@/components/ui/live-badge';
import { getLeagues, getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Ligas · ${siteConfig.name}` };

export default async function LeaguesPage() {
  const [leagues, liveCount] = await Promise.all([getLeagues(), getLiveCount()]);

  return (
    <AppShell active="ligas" counts={{ live: liveCount }}>
      <div className="flex flex-col gap-5">
        <h1 className="text-[26px] font-black tracking-tight">Ligas</h1>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {leagues.map((l) => (
            <Link
              key={l.id}
              href={`/ligas/${l.id}`}
              className="group flex items-center gap-4 rounded-2xl bg-card p-5 transition-colors hover:bg-secondary hover:text-inherit"
            >
              <span className="grid size-13 flex-none place-items-center rounded-full bg-neutral-1 text-sm font-black">{l.short}</span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-base font-extrabold">{l.name}</span>
                <span className="text-md text-muted-foreground">Temporada {l.season} · {l.round}</span>
                <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-subtle">
                  {l.live > 0 && <LiveBadge>{l.live} EN VIVO</LiveBadge>}
                  {l.total} partidos
                </span>
              </span>
              <ChevronRight className="size-5 text-faint transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
