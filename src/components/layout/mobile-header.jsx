import Link from 'next/link';
import { Bell, UserRound } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

/** Encabezado del celular: logo + accesos a notificaciones y perfil (en tablet/escritorio están en la barra lateral). */
export function MobileHeader({ active }) {
  const btn = (on) => cn('grid size-11 place-items-center rounded-full bg-secondary', on ? 'text-primary' : 'text-foreground');
  return (
    <header className="mb-4 flex items-center justify-between md:hidden">
      <Link href="/" aria-label="Inicio"><Logo /></Link>
      <div className="flex items-center gap-2.5">
        <Link href="/notificaciones" aria-label="Notificaciones" className={btn(active === 'notificaciones')}><Bell className="size-5" /></Link>
        <Link href="/perfil" aria-label="Perfil" className={btn(active === 'perfil')}><UserRound className="size-5" /></Link>
      </div>
    </header>
  );
}
