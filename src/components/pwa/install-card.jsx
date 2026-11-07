'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/** Invitación a instalar la PWA; solo aparece si el navegador lo permite. */
export function InstallCard({ title = 'Instala la app', text = 'Recibe avisos de goles y abre la app más rápido.' }) {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setPrompt(e); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || !prompt) return null;

  const install = async () => { prompt.prompt(); await prompt.userChoice; setPrompt(null); };

  return (
    <div className="flex w-full flex-col gap-2.5 rounded-2xl bg-card p-4">
      <strong className="text-sm">{title}</strong>
      <p className="text-md leading-snug text-muted-foreground">{text}</p>
      <Button onClick={install} size="touch" className="w-full">Instalar</Button>
    </div>
  );
}
