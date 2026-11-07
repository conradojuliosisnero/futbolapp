'use client';

import { Volume2 } from '@/components/animate-ui/icons/volume-2';
import { VolumeX } from '@/components/animate-ui/icons/volume-x';
import { Button } from '@/components/ui/button';
import { useMoments } from './moments-provider';

/** Activa o silencia el sonido de las animaciones (se recuerda en el dispositivo). */
export function SoundToggle() {
  const { muted, setMuted } = useMoments();
  return (
    <Button
      variant="secondary"
      size="sm"
      aria-pressed={!muted}
      onClick={() => setMuted(!muted)}
      className="rounded-full"
    >
      {muted ? <VolumeX /> : <Volume2 />} {muted ? 'Sonido apagado' : 'Sonido'}
    </Button>
  );
}
