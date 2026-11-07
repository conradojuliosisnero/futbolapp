'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './client';

/** undefined = cargando, null = sin sesión, objeto = usuario de Firebase */
export function useUser() {
  const [user, setUser] = useState(auth ? undefined : null);
  useEffect(() => (auth ? onAuthStateChanged(auth, setUser) : undefined), []);
  return user;
}
