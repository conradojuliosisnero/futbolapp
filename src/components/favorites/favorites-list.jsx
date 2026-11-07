'use client';

import Link from 'next/link';
import { Star } from '@/components/animate-ui/icons/star';
import { Search } from '@/components/animate-ui/icons/search';
import { TeamCrest } from '@/components/ui/team-crest';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedLink } from '@/components/ui/animated-link';
import { FavoriteStar } from './favorite-star';
import { useUserDoc } from '@/lib/firebase/useUserDoc';
import { leagueByCode } from '@/config/leagues';
import { cn, ENTER, stagger } from '@/lib/utils';

/** Favoritos ordenados: primero "Mi equipo", luego por fecha en que se agregaron. */
function sorted(profile) {
  const myId = profile?.favoriteTeam?.id;
  return Object.entries(profile?.favorites ?? {})
    .map(([id, f]) => ({ id, ...f, mine: id === myId }))
    .sort((a, b) => Number(b.mine) - Number(a.mine) || (a.addedAt?.seconds ?? 0) - (b.addedAt?.seconds ?? 0));
}

/** Lista compacta para la barra lateral (escritorio). */
export function FavoritesNav() {
  const { user, profile } = useUserDoc();
  const favs = sorted(profile);
  return (
    <div className="hidden flex-col gap-1.5 xl:flex">
      <div className="flex items-center justify-between px-3.5 pb-1">
        <Eyebrow>Favoritos</Eyebrow>
        {favs.length > 0 && <Link href="/favoritos" className="text-xs font-semibold text-faint hover:text-primary">Ver todos</Link>}
      </div>
      {favs.slice(0, 6).map((f) => (
        <Link key={f.id} href={`/equipo/${f.id}`} className="flex items-center gap-2.5 px-3.5 py-1.5 text-sm font-semibold">
          <TeamCrest team={f} size="sm" /><span className="truncate">{f.name}</span>
          {f.mine && <Star className="ml-auto size-3.5 fill-primary text-primary" aria-label="Mi equipo" />}
        </Link>
      ))}
      {user !== undefined && !favs.length && (
        <Link href="/favoritos" className="px-3.5 text-xs leading-snug text-faint hover:text-primary">
          {user ? 'Guarda tus equipos con la ★ en su página.' : 'Entra para guardar tus equipos favoritos.'}
        </Link>
      )}
    </div>
  );
}

/** Página de favoritos: tarjetas con acceso al equipo y estrella para quitar. */
export function FavoritesPage() {
  const { user, profile } = useUserDoc();

  if (user === undefined || (user && profile === undefined)) {
    return <div className="grid gap-3 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>;
  }
  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-card px-6 py-10 text-center">
        <Star animate className="size-9 text-primary" aria-hidden />
        <p className="max-w-xs text-muted-foreground">Entra a tu cuenta para guardar tus equipos favoritos y recibir sus avisos.</p>
        <Button asChild size="touch"><Link href="/entrar">Entrar</Link></Button>
      </div>
    );
  }

  const favs = sorted(profile);
  if (!favs.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-card px-6 py-10 text-center">
        <Star animate className="size-9 text-primary" aria-hidden />
        <p className="max-w-xs text-muted-foreground">Aún no tienes favoritos. Busca un equipo y toca <b className="text-foreground">Agregar a favoritos</b>.</p>
        <Button asChild size="touch"><Link href="/buscar"><Search /> Buscar equipos</Link></Button>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {favs.map((f, i) => (
        <li key={f.id} style={stagger(i)} className={cn(ENTER, 'flex items-center gap-3 rounded-2xl bg-card p-3.5 pr-3')}>
          <AnimatedLink href={`/equipo/${f.id}`} className="flex min-w-0 flex-1 items-center gap-3 hover:text-inherit">
            <TeamCrest team={f} size={44} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-base font-extrabold">{f.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {[f.mine && 'Mi equipo', leagueByCode(f.league)?.name].filter(Boolean).join(' · ') || 'Equipo'}
              </span>
            </span>
          </AnimatedLink>
          <FavoriteStar team={f} withLabel={false} className="size-10 justify-center px-0" />
        </li>
      ))}
    </ul>
  );
}
