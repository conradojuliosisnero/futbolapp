'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from '@/components/animate-ui/icons/smartphone';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

const KEY = 'minuto90:install-dismissed';
const SNOOZE_DAYS = 14;

/**
 * Invitación a instalar la app en el celular (encima de la barra inferior).
 * Android/Chrome: botón que abre el diálogo de instalación. iPhone: no hay botón posible → explica "Agregar a inicio".
 */
export function InstallBanner() {
  const [mode, setMode] = useState(null); // null | 'prompt' | 'ios'
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    let snoozed = false;
    try { snoozed = Date.now() < Number(localStorage.getItem(KEY) || 0); } catch { /* sin almacenamiento */ }
    if (standalone || snoozed) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    // iOS no dispara beforeinstallprompt: se muestran las instrucciones.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende del navegador, solo se sabe tras hidratar
    if (ios) setMode('ios');

    const onPrompt = (e) => { e.preventDefault(); setPrompt(e); setMode('prompt'); };
    const onInstalled = () => setMode(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    try { localStorage.setItem(KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000)); } catch { /* modo privado */ }
    setMode(null);
  };
  const install = async () => {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome !== 'accepted') dismiss(); else setMode(null);
  };

  return (
    <div
      role="dialog"
      aria-label={`Instalar ${siteConfig.name}`}
      className="fixed inset-x-3 bottom-[calc(92px+env(safe-area-inset-bottom))] z-50 flex items-center gap-3 rounded-3xl bg-popover p-3.5 shadow-2xl ring-1 ring-border animate-in fade-in-0 slide-in-from-bottom-4 duration-300 md:hidden"
    >
      <span className="grid size-11 flex-none place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Smartphone animate loop loopDelay={2500} className="size-5" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <strong className="text-sm">Instala {siteConfig.name}</strong>
        <span className="text-xs leading-snug text-muted-foreground">
          {mode === 'ios'
            ? <>Toca <b className="text-foreground">Compartir</b> y luego <b className="text-foreground">“Agregar a inicio”</b>.</>
            : 'Ábrela como app y recibe avisos de goles.'}
        </span>
      </div>
      {mode === 'prompt' && <Button size="sm" onClick={install} className="rounded-xl px-3 font-bold">Instalar</Button>}
      <button type="button" onClick={dismiss} aria-label="Ahora no" className="grid size-8 flex-none place-items-center rounded-full text-faint hover:text-foreground">✕</button>
    </div>
  );
}
