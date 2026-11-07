import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { TestMatch } from '@/components/test-match/test-match';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Partido de prueba · ${siteConfig.name}`, robots: { index: false } };

// Solo en desarrollo; en producción hay que activarla a propósito con ENABLE_TEST_MATCH=1.
export const dynamic = 'force-dynamic';

export default function TestMatchPage() {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_TEST_MATCH !== '1') notFound();
  return (
    <AppShell active="en-vivo">
      <TestMatch />
    </AppShell>
  );
}
