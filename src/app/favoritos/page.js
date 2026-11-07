import { AppShell } from '@/components/layout/app-shell';
import { FavoritesPage } from '@/components/favorites/favorites-list';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Favoritos · ${siteConfig.name}` };

export default function Favorites() {
  return (
    <AppShell active="favoritos">
      <div className="flex max-w-3xl flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-black tracking-tight">Favoritos</h1>
          <p className="text-sm text-muted-foreground">Tus equipos guardados. De ellos te llegan los avisos de goles, resultados y noticias.</p>
        </div>
        <FavoritesPage />
      </div>
    </AppShell>
  );
}
