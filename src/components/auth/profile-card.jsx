'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from '@/components/animate-ui/icons/log-out';
import { Bell } from '@/components/animate-ui/icons/bell';
import { Star } from '@/components/animate-ui/icons/star';
import { ChevronRight } from '@/components/animate-ui/icons/chevron-right';
import { UserRound } from '@/components/animate-ui/icons/user-round';
import { Mail } from '@/components/animate-ui/icons/mail';
import { Button } from '@/components/ui/button';
import { AnimatedLink } from '@/components/ui/animated-link';
import { ENTER } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogMedia,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/lib/firebase/useUser';
import { firebaseReady } from '@/lib/firebase/client';
import { signOut } from '@/lib/firebase/auth';

const LINKS = [
  { href: '/mi-equipo', label: 'Mi equipo', icon: Star },
  { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
];

function Links() {
  return (
    <nav className="flex flex-col rounded-3xl bg-card px-2">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <AnimatedLink key={href} href={href} className="group flex items-center gap-3 border-b px-3 py-4 text-sm font-semibold transition-colors last:border-b-0 hover:text-primary">
          <Icon className="size-4.5 text-subtle transition-colors group-hover:text-primary" aria-hidden />{label}<ChevronRight className="ml-auto size-4 text-faint transition-transform group-hover:translate-x-0.5" aria-hidden />
        </AnimatedLink>
      ))}
    </nav>
  );
}

function Guest({ text }) {
  return (
    <div className={`${ENTER} flex flex-col items-center gap-4 rounded-3xl bg-card px-6 py-10 text-center`}>
      <span className="grid size-16 place-items-center rounded-full bg-secondary"><UserRound animate className="size-7 text-subtle" aria-hidden /></span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-extrabold">No has iniciado sesión</h2>
        <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
      </div>
      <Button asChild size="touch"><Link href="/entrar">Entrar o crear cuenta</Link></Button>
    </div>
  );
}

export function ProfileCard() {
  const user = useUser();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try { await signOut(); router.replace('/entrar'); }
    finally { setBusy(false); }
  }

  if (!firebaseReady) return <><Guest text="El inicio de sesión no está disponible en este momento." /><Links /></>;

  if (user === undefined) {
    return (
      <div className="flex items-center gap-4 rounded-3xl bg-card p-6" aria-busy="true" aria-label="Cargando perfil">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-1 flex-col gap-2"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-2/3" /></div>
      </div>
    );
  }

  if (!user) return <><Guest text="Entra para seguir equipos, votar en los partidos y recibir avisos." /><Links /></>;

  const initial = (user.displayName || user.email || '?')[0].toUpperCase();

  return (
    <>
      <div className={`${ENTER} flex items-center gap-4 rounded-3xl bg-card p-6`}>
        {user.photoURL
          // eslint-disable-next-line @next/next/no-img-element -- foto de Google, dominio externo
          ? <img src={user.photoURL} alt="" className="size-16 rounded-full object-cover" referrerPolicy="no-referrer" />
          : <span className="grid size-16 place-items-center rounded-full bg-primary text-2xl font-black text-primary-foreground">{initial}</span>}
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-lg font-extrabold">{user.displayName || 'Hincha'}</h2>
          <span className="flex items-center gap-1.5 truncate text-md text-muted-foreground"><Mail className="size-3.5" aria-hidden />{user.email}</span>
        </div>
      </div>

      <Links />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="touch"><LogOut /> Cerrar sesión</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-3xl bg-card">
          <AlertDialogHeader>
            <AlertDialogMedia className="rounded-full bg-live/15 text-live"><LogOut /></AlertDialogMedia>
            <AlertDialogTitle className="text-lg font-extrabold">¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>Dejarás de recibir los avisos de tus equipos en este dispositivo hasta que vuelvas a entrar.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rounded-b-3xl bg-secondary">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={logout} disabled={busy}>Cerrar sesión</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
