import { Flame } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { MyGameCard } from '@/components/game/my-game-card';
import { adminDb } from '@/lib/firebase/admin';
import { currentStreak, TOP } from '@/lib/game/rules.mjs';
import { getLiveCount } from '@/lib/api/matches';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Ranking · ${siteConfig.name}` };

async function topPlayers() {
  const db = adminDb();
  if (!db) return null;
  const snap = await db.collection('leaderboard').orderBy('points', 'desc').limit(TOP).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export default async function RankingPage() {
  const [players, liveCount] = await Promise.all([topPlayers().catch(() => null), getLiveCount()]);
  return (
    <AppShell active="ranking" counts={{ live: liveCount }}>
      <div className="flex max-w-3xl flex-col gap-5">
        <h1 className="text-[26px] font-black tracking-tight">Ranking</h1>
        <MyGameCard />
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-wider text-faint uppercase">Top {TOP}</h2>
          {!players && <p className="py-6 text-center text-muted-foreground">El ranking no está disponible en este momento.</p>}
          {players?.length === 0 && <p className="py-6 text-center text-muted-foreground">Aún nadie tiene puntos. ¡Sé el primero!</p>}
          {players?.map((p, i) => {
            const streak = currentStreak(p);
            return (
              <div key={p.id} className={cn('flex items-center gap-3 rounded-2xl bg-card px-4 py-3', i < 3 && 'ring-1 ring-primary/40')}>
                <span className={cn('w-7 text-center text-sm font-black tabular-nums', i < 3 ? 'text-primary' : 'text-subtle')}>{i + 1}</span>
                {p.photo
                  // eslint-disable-next-line @next/next/no-img-element -- foto de Google del usuario
                  ? <img src={p.photo} alt="" referrerPolicy="no-referrer" className="size-9 rounded-full object-cover" />
                  : <span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-bold">{p.name?.[0]?.toUpperCase() ?? '?'}</span>}
                <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <Flame aria-hidden className={cn('size-3.5', streak ? 'fill-orange-500 text-orange-400' : 'text-faint')} />{streak}
                </span>
                <span className="w-16 text-right font-black tabular-nums">{p.points}</span>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
