'use client';

import { useState } from 'react';
import { AnimateIcon } from '@animate-ui/react/icons';
import { Pause } from '@/components/animate-ui/icons/pause';
import { Play } from '@/components/animate-ui/icons/play';
import { RotateCcw } from '@/components/animate-ui/icons/rotate-ccw';
import { Volume2 } from '@/components/animate-ui/icons/volume-2';
import { VolumeX } from '@/components/animate-ui/icons/volume-x';
import { Maximize } from '@/components/animate-ui/icons/maximize';
import { LiveBadge } from '@/components/ui/live-badge';
import { Media } from '@/components/ui/media';
import { Progress } from '@/components/ui/progress';

function Control({ className, ...props }) {
  return (
    <AnimateIcon animateOnHover animateOnTap asChild>
      <button type="button" className={'flex min-h-8 items-center gap-1.5 transition-[color,transform] hover:text-foreground active:scale-90 [&_svg]:size-4 ' + (className ?? '')} {...props} />
    </AnimateIcon>
  );
}

/** Reemplaza <Media> por tu <video> / reproductor HLS. progress: 0..1 */
export function VideoPlayer({ src, live, progress = 0 }) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);

  return (
    <div className="relative -mx-5 aspect-video overflow-hidden md:mx-0 md:rounded-4xl">
      <Media src={src} label="reproductor de video 16:9" className="absolute inset-0" />
      {live && <div className="absolute top-3.5 right-3.5 md:top-4.5 md:right-5"><LiveBadge /></div>}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 bg-linear-to-b from-transparent to-shade px-4 py-3.5 md:px-5 md:py-4">
        <Progress value={progress * 100} className="rounded-xs bg-input" />
        <div className="flex justify-between text-md font-semibold text-control">
          <div className="flex gap-4">
            <Control onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pausar' : 'Reproducir'}>
              <span key={String(playing)} className="flex animate-in zoom-in-50 fade-in-0 duration-200">{playing ? <Pause /> : <Play />}</span>
            </Control>
            <Control aria-label="Retroceder 10 segundos"><RotateCcw /> 10s</Control>
            <Control onClick={() => setMuted(!muted)} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
              <span key={String(muted)} className="flex animate-in zoom-in-50 fade-in-0 duration-200">{muted ? <VolumeX /> : <Volume2 />}</span>
            </Control>
          </div>
          <div className="flex gap-4">
            <Control>Auto</Control>
            <Control aria-label="Pantalla completa"><Maximize /></Control>
          </div>
        </div>
      </div>
    </div>
  );
}
