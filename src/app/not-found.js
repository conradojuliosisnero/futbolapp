import { EmptyState } from '@/components/ui';

export default function NotFound() {
  return <EmptyState title="Fuera de juego" text="No encontramos esa página." action={{ href: '/', label: 'Volver al inicio' }} />;
}
