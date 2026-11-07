import { AppShell } from '@/components/layout/app-shell';
import { SearchBox } from '@/components/search/search-box';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Buscar · ${siteConfig.name}` };

export default function SearchPage() {
  return (
    <AppShell active="buscar">
      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-[26px] font-black tracking-tight">Buscar</h1>
        <SearchBox variant="page" autoFocus />
        <p className="text-xs text-faint">Equipos y ligas de las competiciones de la app.</p>
      </div>
    </AppShell>
  );
}
