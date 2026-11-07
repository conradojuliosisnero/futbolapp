'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail } from '@/components/animate-ui/icons/mail';
import { Lock } from '@/components/animate-ui/icons/lock';
import { UserRound } from '@/components/animate-ui/icons/user-round';
import { Eye } from '@/components/animate-ui/icons/eye';
import { EyeOff } from '@/components/animate-ui/icons/eye-off';
import { ArrowLeft } from '@/components/animate-ui/icons/arrow-left';
import { KeyRound } from '@/components/animate-ui/icons/key-round';
import { LogIn } from '@/components/animate-ui/icons/log-in';
import { Send } from '@/components/animate-ui/icons/send';
import { LoaderCircle } from '@/components/animate-ui/icons/loader-circle';
import { AnimateIcon } from '@animate-ui/react/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { signIn, signUp, signInWithGoogle, requestPasswordReset, authErrorMessage } from '@/lib/firebase/auth';
import { firebaseReady } from '@/lib/firebase/client';
import { useUser } from '@/lib/firebase/useUser';
import { cn, ENTER } from '@/lib/utils';

const COPY = {
  login: { title: 'Entra a tu cuenta', submit: 'Entrar', icon: LogIn },
  register: { title: 'Crea tu cuenta', submit: 'Crear cuenta', icon: UserRound },
  reset: { title: 'Recupera tu contraseña', submit: 'Enviar enlace', icon: Send },
};

function Field({ label, icon: Icon, end, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.name} className="text-md font-semibold text-muted-foreground">{label}</Label>
      <div className="relative">
        <Icon animate={focused} className={cn('pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 transition-colors', focused ? 'text-primary' : 'text-faint')} aria-hidden />
        <Input id={props.name} required className="h-11 rounded-lg bg-secondary pr-11 pl-10 text-sm font-medium" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} {...props} />
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
  const params = useSearchParams();
  const [mode, setMode] = useState(params.get('modo') === 'registro' ? 'register' : 'login'); // 'login' | 'register' | 'reset'
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
    if (mode === 'reset') return run(() => requestPasswordReset(f), () => setNotice('Si ese correo tiene una cuenta, te llegará un enlace para crear una nueva contraseña.'));
    run(() => (mode === 'register' ? signUp(f) : signIn(f)));
  }

  const card = 'mx-auto flex w-full max-w-100 flex-col gap-5 rounded-3xl bg-card px-6 py-8';

  if (!firebaseReady) {
    return (
      <div className={card}>
        <Logo />
        <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary"><KeyRound animate loop loopDelay={1500} className="size-5" aria-hidden /></span>
        <h1 className="text-[22px] font-black tracking-tight">Login no disponible todavía</h1>
        <p className="text-sm text-muted-foreground">
          El inicio de sesión no está disponible en este momento. Puedes seguir usando la app sin cuenta.
        </p>
        <Button asChild size="touch"><Link href="/">Volver al inicio</Link></Button>
      </div>
    );
  }

  const { title, submit: submitLabel, icon: SubmitIcon } = COPY[mode];
  const passwordToggle = (
    <AnimateIcon animateOnTap asChild>
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center text-faint hover:text-foreground"
    >
      <span key={String(showPassword)} className="flex animate-in zoom-in-50 fade-in-0 duration-200">
        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </span>
    </button>
    </AnimateIcon>
  );

  return (
    <div className={card}>
      <Link href="/" aria-label="Volver al inicio"><Logo /></Link>
      {mode === 'reset' && (
        <AnimateIcon animateOnHover animateOnTap asChild>
          <button type="button" onClick={() => go('login')} className="-mb-2 flex items-center gap-1.5 self-start text-sm font-medium text-subtle hover:text-foreground">
            <ArrowLeft className="size-4" /> Volver
          </button>
        </AnimateIcon>
      )}
      <div key={`title-${mode}`} className={cn(ENTER, 'flex flex-col gap-1.5')}>
        <h1 className="text-[22px] font-black tracking-tight">{title}</h1>
        {mode === 'reset' && <p className="text-sm text-muted-foreground">Escribe tu correo y te enviaremos un enlace.</p>}
      </div>

      <form key={`form-${mode}`} className={cn(ENTER, 'flex flex-col gap-4')} onSubmit={submit}>
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
        {error && <p role="alert" key={error} className="text-md text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">{error}</p>}
        {notice && <p role="status" className="text-md text-primary animate-in fade-in-0 slide-in-from-top-1 duration-300">{notice}</p>}
        <Button type="submit" size="touch" disabled={busy}>
          {busy ? <LoaderCircle animate loop className="size-4" /> : <SubmitIcon />} {submitLabel}
        </Button>
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
