'use client';

import { useEffect, useState } from 'react';
import { useUser } from './useUser';

const cache = new Map(); // uid → Promise<boolean> (una consulta por usuario y carga de la app)

function check(user) {
  if (!cache.has(user.uid)) {
    cache.set(user.uid, user.getIdToken()
      .then((t) => fetch('/api/me', { headers: { Authorization: `Bearer ${t}` } }))
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d) => Boolean(d.admin))
      .catch(() => { cache.delete(user.uid); return false; }));
  }
  return cache.get(user.uid);
}

/** true solo para la cuenta de ADMIN_EMAIL (lo decide el servidor). */
export function useIsAdmin() {
  const user = useUser();
  const [admin, setAdmin] = useState(null); // { uid, value }
  useEffect(() => {
    if (!user) return undefined;
    let alive = true;
    check(user).then((value) => { if (alive) setAdmin({ uid: user.uid, value }); });
    return () => { alive = false; };
  }, [user]);
  return Boolean(user && admin?.uid === user.uid && admin.value);
}
