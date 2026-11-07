'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/firebase/useUser';

/**
 * El servidor no recibió una sesión válida (cookie vencida o recién iniciada): se renueva el token,
 * se guarda en la cookie y se vuelve a pedir la página. Si no hay sesión, se pide entrar.
 */
export function AdminGate() {
  const user = useUser();
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    let tries = 0;
    try { tries = Number(sessionStorage.getItem('m90-admin-retry') || 0); } catch { /* nada */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- se lee sessionStorage solo en el navegador
    if (tries >= 2) { setFailed(true); return; }
    try { sessionStorage.setItem('m90-admin-retry', String(tries + 1)); } catch { /* nada */ }
    user.getIdToken(true).then((token) => {
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `m90_token=${token}; Path=/; Max-Age=3600; SameSite=Lax${secure}`;
      router.refresh();
    }).catch(() => setFailed(true));
  }, [user, router]);

  if (user === null) {
    return (
      <div className="flex flex-col items-start gap-3 p-8">
        <p className="font-bold">Entra con tu cuenta para ver el panel.</p>
        <Link href="/entrar?siguiente=/admin" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Entrar</Link>
      </div>
    );
  }
  return (
    <p className="p-8 text-muted-foreground">
      {failed ? 'No se pudo verificar la sesión. Revisa FIREBASE_SERVICE_ACCOUNT y ADMIN_EMAIL en el servidor.' : 'Verificando sesión…'}
    </p>
  );
}

/** Al entrar bien al panel se limpia el contador de reintentos. */
export function AdminReady() {
  useEffect(() => { try { sessionStorage.removeItem('m90-admin-retry'); } catch { /* nada */ } }, []);
  return null;
}
