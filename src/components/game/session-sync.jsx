'use client';

import { useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { dailyCheckin } from '@/lib/game/client';
import { dayKey } from '@/lib/game/rules.mjs';

const COOKIE = 'm90_token'; // igual que SESSION_COOKIE en server-session.js

/**
 * 1) Guarda el token de Firebase en una cookie para que el servidor sepa quién pide cada página
 *    (conteo de peticiones y panel /admin). Firebase lo renueva antes de que venza (1 h).
 * 2) Registra la visita del día (racha y puntos) una vez por día y dispositivo.
 */
export function SessionSync() {
  useEffect(() => {
    if (!auth) return undefined;
    return onIdTokenChanged(auth, async (user) => {
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      if (!user) { document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`; return; }
      document.cookie = `${COOKIE}=${await user.getIdToken()}; Path=/; Max-Age=3600; SameSite=Lax${secure}`;

      const key = `m90-checkin-${user.uid}`;
      let done = null;
      try { done = localStorage.getItem(key); } catch { /* sin almacenamiento: se pregunta igual */ }
      if (done === dayKey()) return;
      const r = await dailyCheckin().catch(() => null);
      if (r && !r.error) try { localStorage.setItem(key, dayKey()); } catch { /* nada */ }
    });
  }, []);
  return null;
}
