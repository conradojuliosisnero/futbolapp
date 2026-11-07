import { NAV_ITEMS } from '@/config/navigation';
import { AnimatedLink } from '@/components/ui/animated-link';
import { cn } from '@/lib/utils';

export function BottomNav({ active }) {
  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-3 bottom-[calc(20px+env(safe-area-inset-bottom))] z-50 flex h-16 items-center justify-around rounded-full bg-glass backdrop-blur-lg md:hidden"
    >
      {NAV_ITEMS.filter((i) => i.mobile).map((item) => {
        const on = item.id === active || (active === 'en-vivo' && item.id === 'partidos');
        return (
          <AnimatedLink
            key={item.id}
            href={item.href}
            animate={on}
            aria-current={on ? 'page' : undefined}
            className={cn('flex min-h-11 min-w-14 flex-col items-center justify-center gap-1 text-2xs font-semibold transition-colors', on ? 'text-primary' : 'text-subtle')}
          >
            <item.icon aria-hidden className="size-5" />
            {item.label}
          </AnimatedLink>
        );
      })}
    </nav>
  );
}
