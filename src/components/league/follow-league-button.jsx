'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Plus } from 'lucide-react';
import { useUserDoc } from '@/lib/firebase/useUserDoc';
import { setLeagueFollow } from '@/lib/firebase/db';
import { firebaseReady } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';

/** Seguir / Siguiendo una liga. league: { code, name, emblem } */
export function FollowLeagueButton({ league, className }) {
  const { user, profile } = useUserDoc();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!firebaseReady || user === undefined) return null;

  const on = Boolean(profile?.follows?.leagues?.[league.code]);
  const toggle = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return router.push(`/entrar?siguiente=${encodeURIComponent(`/ligas/${league.code}`)}`);
    setBusy(true); setError('');
    try { await setLeagueFollow(user.uid, league, !on); }
    catch (err) { console.warn('No se pudo seguir la liga', err.code ?? err); setError('No se pudo guardar.'); }
    finally { setBusy(false); }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={on}
      aria-label={on ? `Dejar de seguir ${league.name}` : `Seguir ${league.name}`}
      title={error || undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-[background-color,color,transform] active:scale-95 disabled:opacity-60',
        on ? 'bg-primary/15 text-primary' : 'bg-secondary text-control hover:text-foreground',
        error && 'ring-1 ring-destructive',
        className,
      )}
    >
      {on ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      {on ? 'Siguiendo' : 'Seguir'}
    </button>
  );
}
