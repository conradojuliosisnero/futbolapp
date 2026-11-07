'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimateIcon } from '@animate-ui/react/icons';
import { UserRound } from '@/components/animate-ui/icons/user-round';
import { LogOut } from '@/components/animate-ui/icons/log-out';
import { LogIn } from '@/components/animate-ui/icons/log-in';
import { Bell } from '@/components/animate-ui/icons/bell';
import { Star } from '@/components/animate-ui/icons/star';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/lib/firebase/useUser';
import { signOut } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils';

function Avatar({ user, size = 44 }) {
  const style = { width: size, height: size };
  if (user?.photoURL) {
    // eslint-disable-next-line @next/next/no-img-element -- foto de Google (dominio externo)
    return <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="rounded-full object-cover" style={style} />;
  }
  if (user) {
    const initial = (user.displayName || user.email || '?')[0].toUpperCase();
    return <span className="grid place-items-center rounded-full bg-primary text-base font-black text-primary-foreground" style={style}>{initial}</span>;
  }
  return <span className="grid place-items-center rounded-full bg-secondary" style={style}><UserRound className="size-5" /></span>;
}

/** Menú rápido de la cuenta: ver perfil, accesos y cerrar sesión (o entrar si no hay sesión). */
export function UserMenu({ variant = 'icon', side = 'bottom', align = 'end' }) {
  const user = useUser(); // undefined = cargando
  const router = useRouter();
  const item = 'gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold';

  async function logout() {
    await signOut();
    router.replace('/entrar');
  }

  return (
    <DropdownMenu>
      <AnimateIcon animateOnHover animateOnTap asChild>
        <DropdownMenuTrigger
          aria-label={user ? `Cuenta de ${user.displayName || user.email}` : 'Cuenta'}
          className={cn(
            'flex items-center gap-3 rounded-full outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring',
            variant === 'full' && 'w-full rounded-2xl p-1.5 pr-3 hover:bg-card',
          )}
        >
          <Avatar user={user} size={variant === 'full' ? 40 : 44} />
          {variant === 'full' && (
            <span className="hidden min-w-0 flex-1 flex-col text-left xl:flex">
              <span className="truncate text-sm font-bold">{user ? user.displayName || 'Hincha' : 'Invitado'}</span>
              <span className="truncate text-xs text-faint">{user ? user.email : 'Entra a tu cuenta'}</span>
            </span>
          )}
        </DropdownMenuTrigger>
      </AnimateIcon>

      <DropdownMenuContent side={side} align={align} sideOffset={8} className="w-64 rounded-2xl bg-popover p-1.5">
        {user ? (
          <>
            <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2">
              <Avatar user={user} size={36} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold">{user.displayName || 'Hincha'}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className={item}><Link href="/perfil"><UserRound /> Ver perfil</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className={item}><Link href="/mi-equipo"><Star /> Mi equipo</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className={item}><Link href="/notificaciones"><Bell /> Notificaciones</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={logout} className={item}><LogOut /> Cerrar sesión</DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="px-2.5 py-2 text-xs font-normal text-muted-foreground">
              {user === undefined ? 'Cargando…' : 'Entra para seguir equipos y recibir avisos.'}
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className={item}><Link href="/entrar"><LogIn /> Entrar</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className={item}><Link href="/entrar?modo=registro"><UserRound /> Crear cuenta</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className={item}><Link href="/notificaciones"><Bell /> Notificaciones</Link></DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
