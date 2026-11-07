'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMoments } from './moments-provider';

/** Preferencias de las animaciones de los partidos (en el perfil). Con sesión se guardan en la cuenta. */
export function PlaybackPrefs() {
  const { enabled, setEnabled, muted, setMuted } = useMoments();
  const rows = [
    { id: 'pref-animations', label: 'Animaciones de los partidos', hint: 'Goles, tarjetas, VAR y final al entrar a un partido y en vivo.', checked: enabled !== false, onChange: setEnabled, disabled: enabled === null },
    { id: 'pref-sound', label: 'Sonido de las animaciones', hint: 'Efectos de sonido y vibración.', checked: !muted, onChange: (v) => setMuted(!v), disabled: enabled === false },
  ];
  return (
    <section aria-labelledby="prefs-title" className="flex flex-col rounded-3xl bg-card px-5 pt-4">
      <h2 id="prefs-title" className="text-xs font-semibold tracking-wider text-faint uppercase">Preferencias</h2>
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-4 border-b py-4 last:border-b-0">
          <Label htmlFor={r.id} className="flex flex-col items-start gap-1">
            <span className="text-sm font-bold">{r.label}</span>
            <span className="text-md font-normal text-muted-foreground">{r.hint}</span>
          </Label>
          <Switch id={r.id} checked={r.checked} disabled={r.disabled} onCheckedChange={r.onChange} />
        </div>
      ))}
    </section>
  );
}
