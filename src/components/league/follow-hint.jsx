'use client';

import { useFollowedLeagues } from '@/lib/firebase/useFollowedLeagues';

/** Explica para qué sirve seguir ligas (en /ligas). */
export function FollowHint() {
  const { user, followed } = useFollowedLeagues();
  if (!user) return <p className="-mt-2 text-sm text-muted-foreground">Entra y sigue tus ligas para ver solo sus partidos.</p>;
  return (
    <p className="-mt-2 text-sm text-muted-foreground">
      {followed
        ? `Sigues ${followed.size} ${followed.size === 1 ? 'liga' : 'ligas'}: en Inicio y Partidos solo verás sus partidos.`
        : 'Sigue las ligas que te interesan: en Inicio y Partidos solo verás sus partidos.'}
    </p>
  );
}
