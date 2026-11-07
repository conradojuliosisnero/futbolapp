import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Entrar · ${siteConfig.name}` };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <Suspense><LoginForm /></Suspense>
    </main>
  );
}
