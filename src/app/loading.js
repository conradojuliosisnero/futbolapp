import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';

// Pantalla de carga de todas las rutas mientras llegan los datos (se nota cuando haya API real).
export default function Loading() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando">
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-9 w-20 rounded-full" />)}
        </div>
        <Skeleton className="h-80 rounded-4xl md:h-110" />
        <Skeleton className="h-6 w-48" />
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      </div>
    </AppShell>
  );
}
