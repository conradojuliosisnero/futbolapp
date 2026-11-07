'use client';

import { useEffect, useState } from 'react';
import { useUser } from './useUser';
import { watchUserDoc } from './db';

/** { user, profile }: usuario de Auth y su documento en Firestore (undefined = cargando, null = no hay). */
export function useUserDoc() {
  const user = useUser();
  const [profile, setProfile] = useState(undefined);
  useEffect(() => (user ? watchUserDoc(user.uid, setProfile) : undefined), [user]);
  return { user, profile: user ? profile : user };
}
