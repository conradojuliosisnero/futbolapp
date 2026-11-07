import Link from 'next/link';
import { NAV_ITEMS, FOLLOWING } from '@/config/navigation';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';
import { TeamCrest } from '@/components/ui/team-crest';
import { Eyebrow } from '@/components/ui/eyebrow';
import { InstallCard } from '@/components/pwa/install-card';
import { AnimatedLink } from '@/components/ui/animated-link';
import { UserMenu } from '@/components/auth/user-menu';
import { cn } from '@/lib/utils';

export function Sidebar({ active, counts = {} }) {
  return (
    <nav
      aria-label="Principal"
      className="no-scrollbar sticky top-0 hidden h-screen flex-col items-center gap-7 overflow-y-auto border-r px-3 py-7 md:row-span-2 md:flex xl:row-span-1 xl:items-stretch xl:px-5"
    >
      <Link href="/" className="hidden pl-2.5 xl:block"><Logo /></Link>
      <Link href="/" className="xl:hidden" aria-label="Inicio"><Logo variant="mark" /></Link>

      <ul className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const on = item.id === active;
          const count = item.badgeKey && counts[item.badgeKey];
          return (
            <li key={item.id}>
              <AnimatedLink
                href={item.href}
                animate={on}
                title={item.label}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex size-13 items-center justify-center rounded-2xl text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground',
                  'xl:size-auto xl:justify-start xl:gap-3 xl:px-3.5 xl:py-3',
                  on && 'bg-secondary text-primary xl:text-foreground',
                )}
              >
                <item.icon aria-hidden className={cn('size-5 shrink-0 xl:size-4', on && 'xl:text-primary')} />
                <span className="hidden xl:inline">{item.label}</span>
                {count ? <Badge variant="live" className="ml-auto hidden xl:inline-flex">{count}</Badge> : null}
              </AnimatedLink>
            </li>
          );
        })}
      </ul>

      <div className="hidden flex-col gap-1.5 xl:flex">
        <div className="px-3.5 pb-1"><Eyebrow>Siguiendo</Eyebrow></div>
        {FOLLOWING.map((f) => (
          <Link key={f.id} href={f.href} className="flex items-center gap-2.5 px-3.5 py-1.5 text-sm font-semibold">
            <TeamCrest team={{ name: f.label, crest: f.crest }} size="sm" />{f.label}
          </Link>
        ))}
      </div>

      <div className="mt-auto hidden xl:flex"><InstallCard /></div>
      <div className="mt-auto w-full xl:mt-0"><UserMenu variant="full" side="right" align="end" /></div>
    </nav>
  );
}
