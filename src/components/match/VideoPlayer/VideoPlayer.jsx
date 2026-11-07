'use client';

import { useState } from 'react';
import { LiveBadge, Media, ProgressBar } from '@/components/ui';
import styles from './VideoPlayer.module.css';

/** Reemplaza <Media> por tu <video> / reproductor HLS. */
export default function VideoPlayer({ src, live, progress = 0 }) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);

  return (
    <div className={styles.player}>
      <Media src={src} label="reproductor de video 16:9" className={styles.media} />
      {live && <div className={styles.badge}><LiveBadge /></div>}
      <div className={styles.controls}>
        <ProgressBar value={progress} />
        <div className={styles.buttons}>
          <div className={styles.group}>
            <button onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pausar' : 'Reproducir'}>{playing ? '❚❚' : '▶'}</button>
            <button aria-label="Retroceder 10 segundos">↺ 10s</button>
            <button onClick={() => setMuted(!muted)}>{muted ? 'Sin sonido' : 'Sonido'}</button>
          </div>
          <div className={styles.group}>
            <button>Auto</button>
            <button aria-label="Pantalla completa">⛶</button>
          </div>
        </div>
      </div>
    </div>
  );
}
