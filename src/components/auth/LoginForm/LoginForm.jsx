'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Logo } from '@/components/ui';
import { signIn, signUp, signInWithGoogle, authErrorMessage } from '@/lib/firebase/auth';
import styles from './LoginForm.module.css';

export default function LoginForm({ redirectTo = '/' }) {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';

  async function run(action) {
    setError(''); setBusy(true);
    try { await action(); router.push(redirectTo); }
    catch (e) { setError(authErrorMessage(e)); }
    finally { setBusy(false); }
  }

  function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    run(() => (isRegister ? signUp(f) : signIn(f)));
  }

  return (
    <div className={styles.card}>
      <Logo />
      <h1 className={styles.title}>{isRegister ? 'Crea tu cuenta' : 'Entra a tu cuenta'}</h1>

      <form className={styles.form} onSubmit={submit}>
        {isRegister && (
          <label className={styles.field}>Nombre
            <input name="name" required autoComplete="name" />
          </label>
        )}
        <label className={styles.field}>Correo
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className={styles.field}>Contraseña
          <input name="password" type="password" required minLength={6}
            autoComplete={isRegister ? 'new-password' : 'current-password'} />
        </label>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <Button type="submit" size="lg" fullWidth disabled={busy}>{isRegister ? 'Crear cuenta' : 'Entrar'}</Button>
      </form>

      <div className={styles.divider}><span>o</span></div>
      <Button variant="outline" size="lg" fullWidth disabled={busy} onClick={() => run(signInWithGoogle)}>
        Continuar con Google
      </Button>

      <Button variant="ghost" onClick={() => { setMode(isRegister ? 'login' : 'register'); setError(''); }}>
        {isRegister ? '¿Ya tienes cuenta? Entra' : '¿No tienes cuenta? Regístrate'}
      </Button>
    </div>
  );
}
