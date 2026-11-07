'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, UserRound, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { signIn, signUp, signInWithGoogle, resetPassword, authErrorMessage } from '@/lib/firebase/auth';
import { firebaseReady } from '@/lib/firebase/client';
import { useUser } from '@/lib/firebase/useUser';

const COPY = {
  login: { title: 'Entra a tu cuenta', submit: 'Entrar' },
  register: { title: 'Crea tu cuenta', submit: 'Crear cuenta' },
  reset: { title: 'Recupera tu contraseña', submit: 'Enviar enlace' },
};

function Field({ label, icon: Icon, end, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.name} className="text-md font-semibold text-muted-foreground">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
        <Input id={props.name} required className="h-11 rounded-lg bg-secondary pr-11 pl-10 text-sm font-medium" {...props} />
        {end}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

export function LoginForm({ redirectTo = '/' }) {
  const router = useRouter();
  const user = useUser();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Si ya tiene sesión, no tiene sentido mostrar el login.
  useEffect(() => { if (user) router.replace('/perfil'); }, [user, router]);

  const go = (next) => { setMode(next); setError(''); setNotice(''); };

  async function run(action, after = () => router.push(redirectTo)) {
    setError(''); setNotice(''); setBusy(true);
    try { await action(); after(); }
    catch (e) { setError(authErrorMessage(e)); }
    finally { setBusy(false); }
  }

  function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    if (mode === 'reset') return run(() => resetPassword(f), () => setNotice('Te enviamos un correo con el enlace para crear una nueva contraseña.'));
    run(() => (mode === 'register' ? signUp(f) : signIn(f)));
  }

  const card = 'mx-auto flex w-full max-w-100 flex-col gap-5 rounded-3xl bg-card px-6 py-8';

  if (!firebaseReady) {
    return (
      <div className={card}>
        <Logo />
        <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary"><KeyRound className="size-5" aria-hidden /></span>
        <h1 className="text-[22px] font-black tracking-tight">Login no disponible todavía</h1>
        <p className="text-sm text-muted-foreground">
          La app está en modo de prueba. El inicio de sesión se activa al agregar las credenciales de Firebase en <code>.env.local</code>.
        </p>
        <Button asChild size="touch"><Link href="/">Volver al inicio</Link></Button>
      </div>
    );
  }

  const { title, submit: submitLabel } = COPY[mode];
  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center text-faint hover:text-foreground"
    >
      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );

  return (
    <div className={card}>
      <Link href="/" aria-label="Volver al inicio"><Logo /></Link>
      {mode === 'reset' && (
        <button type="button" onClick={() => go('login')} className="-mb-2 flex items-center gap-1.5 self-start text-sm font-medium text-subtle hover:text-foreground">
          <ArrowLeft className="size-4" /> Volver
        </button>
      )}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-black tracking-tight">{title}</h1>
        {mode === 'reset' && <p className="text-sm text-muted-foreground">Escribe tu correo y te enviaremos un enlace.</p>}
      </div>

      <form className="flex flex-col gap-4" onSubmit={submit}>
        {mode === 'register' && <Field label="Nombre" name="name" icon={UserRound} autoComplete="name" />}
        <Field label="Correo" name="email" type="email" icon={Mail} autoComplete="email" />
        {mode !== 'reset' && (
          <Field
            label="Contraseña" name="password" icon={Lock} minLength={6}
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            end={passwordToggle}
          />
        )}
        {mode === 'login' && (
          <button type="button" onClick={() => go('reset')} className="-mt-1 self-end text-md font-semibold text-primary">
            ¿Olvidaste tu contraseña?
          </button>
        )}
        {error && <p role="alert" className="text-md text-destructive">{error}</p>}
        {notice && <p role="status" className="text-md text-primary">{notice}</p>}
        <Button type="submit" size="touch" disabled={busy}>{submitLabel}</Button>
      </form>

      {mode !== 'reset' && (
        <>
          <div className="flex items-center gap-3 text-xs text-faint before:h-px before:flex-1 before:bg-input after:h-px after:flex-1 after:bg-input">o</div>
          <Button variant="outline" size="touch" disabled={busy} onClick={() => run(signInWithGoogle)}>
            <GoogleIcon /> Continuar con Google
          </Button>
          <Button variant="ghost" onClick={() => go(mode === 'register' ? 'login' : 'register')}>
            {mode === 'register' ? '¿Ya tienes cuenta? Entra' : '¿No tienes cuenta? Regístrate'}
          </Button>
        </>
      )}
    </div>
  );
}
