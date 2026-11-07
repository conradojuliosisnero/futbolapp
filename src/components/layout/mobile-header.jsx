import Link from 'next/link';
import { Bell } from '@/components/animate-ui/icons/bell';
import { Search } from '@/components/animate-ui/icons/search';
import { UserRound } from '@/components/animate-ui/icons/user-round';
import { AnimatedLink } from '@/components/ui/animated-link';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

/** Encabezado del celular: logo + accesos a notificaciones y perfil (en tablet/escritorio están en la barra lateral). */
export function MobileHeader({ active }) {
  const btn = (on) => cn('grid size-11 place-items-center rounded-full bg-secondary', on ? 'text-primary' : 'text-foreground');
  return (
    <header className="mb-4 flex items-center justify-between md:hidden">
      <Link href="/" aria-label="Inicio"><Logo /></Link>
      <div className="flex items-center gap-2.5">
        <AnimatedLink href="/buscar" aria-label="Buscar" className={btn(active === 'buscar')}><Search className="size-5" /></AnimatedLink>
        <AnimatedLink href="/notificaciones" aria-label="Notificaciones" className={btn(active === 'notificaciones')}><Bell className="size-5" /></AnimatedLink>
        <AnimatedLink href="/perfil" aria-label="Perfil" className={btn(active === 'perfil')}><UserRound className="size-5" /></AnimatedLink>
      </div>
    </header>
  );
}
