import Link from 'next/link';
import { Search } from '@/components/animate-ui/icons/search';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { StatusScreen } from '@/components/ui/status-screen';

export default function NotFound() {
  return (
    <AppShell>
      <StatusScreen icon={Search} code="404" title="Fuera de juego" text="Esta página no existe o el partido ya no está disponible.">
        <Button asChild size="touch"><Link href="/">Volver al inicio</Link></Button>
        <Button asChild size="touch" variant="outline"><Link href="/partidos">Ver partidos</Link></Button>
      </StatusScreen>
    </AppShell>
  );
}
