'use client';

import { useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX, Maximize } from 'lucide-react';
import { LiveBadge } from '@/components/ui/live-badge';
import { Media } from '@/components/ui/media';
import { Progress } from '@/components/ui/progress';

/** Reemplaza <Media> por tu <video> / reproductor HLS. progress: 0..1 */
export function VideoPlayer({ src, live, progress = 0 }) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const btn = 'flex min-h-8 items-center gap-1.5 [&_svg]:size-4';

  return (
    <div className="relative -mx-5 aspect-video overflow-hidden md:mx-0 md:rounded-4xl">
      <Media src={src} label="reproductor de video 16:9" className="absolute inset-0" />
      {live && <div className="absolute top-3.5 right-3.5 md:top-4.5 md:right-5"><LiveBadge /></div>}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 bg-linear-to-b from-transparent to-shade px-4 py-3.5 md:px-5 md:py-4">
        <Progress value={progress * 100} className="rounded-xs bg-input" />
        <div className="flex justify-between text-md font-semibold text-control">
          <div className="flex gap-4">
            <button type="button" className={btn} onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pausar' : 'Reproducir'}>
              {playing ? <Pause /> : <Play />}
            </button>
            <button type="button" className={btn} aria-label="Retroceder 10 segundos"><RotateCcw /> 10s</button>
            <button type="button" className={btn} onClick={() => setMuted(!muted)} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
              {muted ? <VolumeX /> : <Volume2 />}
            </button>
          </div>
          <div className="flex gap-4">
            <button type="button" className={btn}>Auto</button>
            <button type="button" className={btn} aria-label="Pantalla completa"><Maximize /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
