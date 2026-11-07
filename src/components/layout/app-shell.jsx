import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { MobileHeader } from './mobile-header';
import { PageTransition } from './page-transition';
import { InstallBanner } from '@/components/pwa/install-banner';

/**
 * Estructura responsive:
 *  < 768   una columna + BottomNav
 *  768+    Sidebar compacta (iconos), aside debajo del contenido
 *  1200+   Sidebar completa | contenido | aside fijo
 */
export function AppShell({ active, counts = {}, aside, asideWide = false, children }) {
  return (
    <div
      className={cn(
        'grid min-h-screen grid-cols-[minmax(0,1fr)] pb-[calc(64px+48px+env(safe-area-inset-bottom))]',
        'md:grid-cols-[84px_minmax(0,1fr)] md:pb-8',
        'xl:pb-0',
        !aside ? 'xl:grid-cols-[240px_minmax(0,1fr)]'
          : asideWide ? 'xl:grid-cols-[240px_minmax(0,1fr)_400px]' : 'xl:grid-cols-[240px_minmax(0,1fr)_380px]',
      )}
    >
      <Sidebar active={active} counts={counts} />
      <main className="min-w-0 px-5 pt-4 md:px-8 md:pt-7 xl:py-7">
        <MobileHeader active={active} />
        <PageTransition>{children}</PageTransition>
      </main>
      {aside && (
        <aside className="min-w-0 px-5 pt-6 md:p-7 md:px-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:border-l xl:px-6">
          {aside}
        </aside>
      )}
      <InstallBanner />
      <BottomNav active={active} />
    </div>
  );
}
