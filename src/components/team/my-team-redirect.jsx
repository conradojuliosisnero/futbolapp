'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserDoc } from '@/lib/firebase/useUserDoc';

/** En /mi-equipo: si el usuario eligió su equipo, lo lleva a la página de ese equipo. */
export function MyTeamRedirect({ defaultId }) {
  const { profile } = useUserDoc();
  const router = useRouter();
  const id = profile?.favoriteTeam?.id;
  useEffect(() => {
    if (id && id !== String(defaultId)) router.replace(`/equipo/${id}`);
  }, [id, defaultId, router]);
  return null;
}
