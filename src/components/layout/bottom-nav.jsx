import Link from 'next/link';
import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

export function BottomNav({ active }) {
  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-5 bottom-[calc(20px+env(safe-area-inset-bottom))] z-50 flex h-16 items-center justify-around rounded-full bg-glass backdrop-blur-lg md:hidden"
    >
      {NAV_ITEMS.filter((i) => i.mobile).map((item) => {
        const on = item.id === active || (active === 'en-vivo' && item.id === 'partidos');
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={on ? 'page' : undefined}
            className={cn('flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 text-xs font-semibold', on ? 'text-primary' : 'text-subtle')}
          >
            <span className={cn('size-1.5 rounded-full', on && 'bg-primary')} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
