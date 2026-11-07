'use client';

import { useUserDoc } from './useUserDoc';

/**
 * Ligas que sigue el usuario. followed: Set de códigos, o null = mostrar todas
 * (sin sesión, cargando, o aún no sigue ninguna).
 */
export function useFollowedLeagues() {
  const { user, profile } = useUserDoc();
  const codes = Object.keys(profile?.follows?.leagues ?? {});
  return { user, profile, followed: codes.length ? new Set(codes) : null };
}

/** Grupos [{ leagueId, ... }] solo de las ligas seguidas (todas si followed es null). */
export const onlyFollowed = (groups, followed) => (followed ? groups.filter((g) => followed.has(g.leagueId)) : groups);
