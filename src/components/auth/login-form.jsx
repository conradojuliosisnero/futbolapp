'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { signIn, signUp, signInWithGoogle, authErrorMessage } from '@/lib/firebase/auth';

function Field({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.name} className="text-md font-semibold text-muted-foreground">{label}</Label>
      <Input id={props.name} required className="h-11 rounded-lg bg-secondary px-4 text-sm font-medium" {...props} />
    </div>
  );
}

export function LoginForm({ redirectTo = '/' }) {
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
    <div className="mx-auto flex w-full max-w-100 flex-col gap-5 rounded-2xl bg-card px-6 py-8">
      <Logo />
      <h1 className="text-[22px] font-black tracking-tight">{isRegister ? 'Crea tu cuenta' : 'Entra a tu cuenta'}</h1>

      <form className="flex flex-col gap-4" onSubmit={submit}>
        {isRegister && <Field label="Nombre" name="name" autoComplete="name" />}
        <Field label="Correo" name="email" type="email" autoComplete="email" />
        <Field label="Contraseña" name="password" type="password" minLength={6}
          autoComplete={isRegister ? 'new-password' : 'current-password'} />
        {error && <p role="alert" className="text-md text-destructive">{error}</p>}
        <Button type="submit" size="touch" disabled={busy}>{isRegister ? 'Crear cuenta' : 'Entrar'}</Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-faint before:h-px before:flex-1 before:bg-input after:h-px after:flex-1 after:bg-input">o</div>
      <Button variant="outline" size="touch" disabled={busy} onClick={() => run(signInWithGoogle)}>
        Continuar con Google
      </Button>

      <Button variant="ghost" onClick={() => { setMode(isRegister ? 'login' : 'register'); setError(''); }}>
        {isRegister ? '¿Ya tienes cuenta? Entra' : '¿No tienes cuenta? Regístrate'}
      </Button>
    </div>
  );
}
