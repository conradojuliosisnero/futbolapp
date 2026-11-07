'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TriangleAlert } from '@/components/animate-ui/icons/triangle-alert';
import { RefreshCw } from '@/components/animate-ui/icons/refresh-cw';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { StatusScreen } from '@/components/ui/status-screen';

// Error en una página (por ejemplo, la API no responde). Se muestra dentro de AppShell para no perder el menú.
export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <AppShell>
      <StatusScreen icon={TriangleAlert} tone="danger" title="Falta en el área" text="Algo salió mal al cargar esta pantalla. Intenta de nuevo en un momento.">
        <Button size="touch" onClick={reset}><RefreshCw /> Reintentar</Button>
        <Button asChild size="touch" variant="outline"><Link href="/">Ir al inicio</Link></Button>
      </StatusScreen>
    </AppShell>
  );
}
