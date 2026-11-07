'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimateIcon } from '@animate-ui/react/icons';
import { Star } from '@/components/animate-ui/icons/star';
import { useUserDoc } from '@/lib/firebase/useUserDoc';
import { addFavorite, removeFavorite } from '@/lib/firebase/db';
import { firebaseReady } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';

/** Estrella para guardar o quitar un equipo de favoritos. team: { id, name, crest, league } */
export function FavoriteStar({ team, withLabel = true, className }) {
  const { user, profile } = useUserDoc();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!firebaseReady || user === undefined) return null;

  const on = Boolean(profile?.favorites?.[String(team.id)]);
  const toggle = async () => {
    if (!user) return router.push('/entrar');
    setBusy(true);
    try {
      if (on) await removeFavorite(user.uid, team.id, { wasMyTeam: profile?.favoriteTeam?.id === String(team.id) });
      else await addFavorite(user.uid, team);
    } catch (e) {
      console.warn('No se pudo actualizar favoritos', e.code ?? e);
    } finally { setBusy(false); }
  };

  return (
    <AnimateIcon animateOnTap animateOnHover asChild>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={on}
        aria-label={on ? `Quitar ${team.name} de favoritos` : `Guardar ${team.name} en favoritos`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-[background-color,color,transform] active:scale-95 disabled:opacity-60',
          on ? 'bg-primary/15 text-primary' : 'bg-secondary text-control hover:text-foreground',
          className,
        )}
      >
        <Star className={cn('size-4 transition-[fill]', on && 'fill-current')} />
        {withLabel && (on ? 'Favorito' : 'Agregar a favoritos')}
      </button>
    </AnimateIcon>
  );
}
