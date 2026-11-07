'use client';

import { useEffect, useState } from 'react';
import { useUser } from './useUser';
import { watchUserDoc } from './db';
import { ensureUserDoc } from './auth';

// Una sola creación por usuario aunque varios componentes usen este hook a la vez.
const creating = new Map();

/** { user, profile }: usuario de Auth y su documento en Firestore (undefined = cargando, null = no hay). */
export function useUserDoc() {
  const user = useUser();
  const [profile, setProfile] = useState(undefined);
  useEffect(() => {
    if (!user) return undefined;
    return watchUserDoc(user.uid, (data, exists) => {
      setProfile(data);
      // Cuentas creadas antes de que existieran las reglas pueden no tener documento: se crea ahora.
      if (exists === false && !creating.has(user.uid)) {
        creating.set(user.uid, ensureUserDoc(user).catch((e) => console.warn('No se pudo crear el perfil', e.code ?? e)));
      }
    });
  }, [user]);
  return { user, profile: user ? profile : user };
}
