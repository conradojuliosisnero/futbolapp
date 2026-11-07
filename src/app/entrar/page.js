import { LoginForm } from '@/components/auth';
import { siteConfig } from '@/config/site';
import styles from './page.module.css';

export const metadata = { title: `Entrar · ${siteConfig.name}` };

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <LoginForm />
    </main>
  );
}
