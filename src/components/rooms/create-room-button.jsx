'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UserRound } from '@/components/animate-ui/icons/user-round';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/firebase/useUser';
import { firebaseReady } from '@/lib/firebase/client';
import { createRoom } from '@/lib/firebase/rooms';

/** "Crear sala" para ver el partido con amigos (solo en vivo o por empezar). */
export function CreateRoomButton({ match }) {
  const user = useUser();
  const router = useRouter();
  const path = usePathname();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!firebaseReady || match.status === 'finished' || user === undefined) return null;

  if (!user) {
    return (
      <Button asChild variant="secondary" size="sm" className="rounded-full">
        <Link href={`/entrar?siguiente=${encodeURIComponent(path)}`}><UserRound /> Crear sala</Link>
      </Button>
    );
  }
  const create = async () => {
    setBusy(true); setError('');
    try {
      const id = await createRoom(user, match);
      router.push(`/partido/${match.id}/sala/${id}`);
    } catch (e) {
      console.warn('No se pudo crear la sala', e.code ?? e);
      setError('No se pudo crear la sala. Intenta de nuevo.');
      setBusy(false);
    }
  };
  return (
    <span className="flex flex-col items-end gap-1">
      <Button variant="secondary" size="sm" className="rounded-full" onClick={create} disabled={busy}><UserRound /> {busy ? 'Creando…' : 'Crear sala'}</Button>
      {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
