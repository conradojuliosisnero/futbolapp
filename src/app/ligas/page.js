import { ChevronRight } from '@/components/animate-ui/icons/chevron-right';
import { AppShell } from '@/components/layout/app-shell';
import { LiveBadge } from '@/components/ui/live-badge';
import { AnimatedLink } from '@/components/ui/animated-link';
import { cn, ENTER, stagger } from '@/lib/utils';
import { getLeagues, getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';
import { FollowLeagueButton } from '@/components/league/follow-league-button';
import { FollowHint } from '@/components/league/follow-hint';

export const metadata = { title: `Ligas · ${siteConfig.name}` };

export default async function LeaguesPage() {
  const [leagues, liveCount] = await Promise.all([getLeagues(), getLiveCount()]);

  return (
    <AppShell active="ligas" counts={{ live: liveCount }}>
      <div className="flex flex-col gap-5">
        <h1 className="text-[26px] font-black tracking-tight">Ligas</h1>
        <FollowHint />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {leagues.map((l, i) => (
            <div key={l.id} className="relative">
            <AnimatedLink
              href={`/ligas/${l.id}`}
              style={stagger(i)}
              className={cn(ENTER, 'group flex items-center gap-4 rounded-2xl bg-card p-5 pt-11 transition-[background-color,transform] hover:bg-secondary hover:text-inherit')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- escudo de la API externa */}
              <span className="grid size-13 flex-none place-items-center rounded-full bg-white p-2"><img src={l.emblem} alt="" className="size-full object-contain" /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-base font-extrabold">{l.name}</span>
                <span className="text-md text-muted-foreground">{l.country}</span>
                <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-subtle">
                  {l.live > 0 && <LiveBadge>{l.live} EN VIVO</LiveBadge>}
                  {l.total} partidos esta semana
                </span>
              </span>
              <ChevronRight className="size-5 text-faint transition-transform group-hover:translate-x-0.5" />
            </AnimatedLink>
            <FollowLeagueButton league={{ code: l.code, name: l.name, emblem: l.emblem }} className="absolute top-3 right-3 px-2.5 py-1 text-xs" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
