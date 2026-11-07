'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import styles from './InstallCard.module.css';

/** Invitación a instalar la PWA; solo aparece si el navegador lo permite. */
export default function InstallCard({ title = 'Instala la app', text = 'Recibe avisos de goles y abre la app más rápido.' }) {
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
    <div className={styles.card}>
      <strong className={styles.title}>{title}</strong>
      <p className={styles.text}>{text}</p>
      <Button onClick={install} fullWidth>Instalar</Button>
    </div>
  );
}
