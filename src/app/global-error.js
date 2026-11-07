'use client';

import { TriangleAlert } from '@/components/animate-ui/icons/triangle-alert';
import { RefreshCw } from '@/components/animate-ui/icons/refresh-cw';
import { Button } from '@/components/ui/button';
import { StatusScreen } from '@/components/ui/status-screen';
import '@/styles/globals.css';

// Último recurso: falló el layout raíz. Reemplaza toda la página, por eso trae su propio <html>.
export default function GlobalError({ reset }) {
  return (
    <html lang="es" className="dark">
      <body>
        <StatusScreen icon={TriangleAlert} tone="danger" title="Se cayó el partido" text="La app tuvo un error inesperado. Recarga para volver a intentarlo.">
          <Button size="touch" onClick={reset}><RefreshCw /> Recargar</Button>
        </StatusScreen>
      </body>
    </html>
  );
}
