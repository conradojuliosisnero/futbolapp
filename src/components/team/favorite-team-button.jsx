'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star } from '@/components/animate-ui/icons/star';
import { Button } from '@/components/ui/button';
import { useUserDoc } from '@/lib/firebase/useUserDoc';
import { setFavoriteTeam } from '@/lib/firebase/db';
import { firebaseReady } from '@/lib/firebase/client';

/** Marca este equipo como "Mi equipo" (de él llegan los avisos de goles y noticias). */
export function FavoriteTeamButton({ team }) {
  const { user, profile } = useUserDoc();
  const [busy, setBusy] = useState(false);
  if (!firebaseReady || user === undefined) return null;

  if (!user) {
    return (
      <Button asChild variant="secondary" size="sm" className="rounded-full">
        <Link href="/entrar"><Star /> Entra para hacerlo tu equipo</Link>
      </Button>
    );
  }
  const mine = profile?.favoriteTeam?.id === String(team.id);
  const choose = async () => {
    setBusy(true);
    try { await setFavoriteTeam(user.uid, team); } finally { setBusy(false); }
  };
  return mine ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-sm font-bold text-primary animate-in zoom-in-90 duration-300">
      <Star animate className="size-4 fill-current" /> Mi equipo
    </span>
  ) : (
    <Button variant="secondary" size="sm" disabled={busy} onClick={choose} className="rounded-full">
      <Star /> Hacer mi equipo
    </Button>
  );
}
