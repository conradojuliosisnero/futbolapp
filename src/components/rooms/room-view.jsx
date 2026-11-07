'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Send } from '@/components/animate-ui/icons/send';
import { LogOut } from '@/components/animate-ui/icons/log-out';
import { UserRound } from '@/components/animate-ui/icons/user-round';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/lib/firebase/useUser';
import {
  watchRoom, watchMyMembership, watchMembers, watchMessages, joinRoom, leaveRoom, deleteRoom, deleteMessage, sendMessage,
  MESSAGE_COOLDOWN_S, MESSAGE_MAX,
} from '@/lib/firebase/rooms';
import { cn, ENTER } from '@/lib/utils';

const hhmm = (ts) => (ts?.toDate ? ts.toDate().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false }) : '');

function Avatar({ person, size = 28 }) {
  const style = { width: size, height: size };
  // eslint-disable-next-line @next/next/no-img-element -- foto de perfil externa
  if (person?.photo) return <img src={person.photo} alt="" referrerPolicy="no-referrer" className="flex-none rounded-full object-cover" style={style} />;
  return <span className="grid flex-none place-items-center rounded-full bg-accent text-xs font-black" style={style}>{(person?.name ?? '?')[0].toUpperCase()}</span>;
}

/** Segundos que faltan para poder volver a escribir (mismo límite que aplican las reglas). */
function useCooldown(lastMessageAt) {
  const [now, setNow] = useState(() => Date.now());
  const last = lastMessageAt?.toMillis?.() ?? 0;
  const left = Math.max(0, Math.ceil((last + MESSAGE_COOLDOWN_S * 1000 - now) / 1000));
  // El reloj avanza siempre (1 vez por segundo): así la cuenta parte bien en 60 al enviar.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

function InviteButton({ title }) {
  const [msg, setMsg] = useState('');
  const invite = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `Sala: ${title}`, text: `Mira ${title} conmigo en Minuto 90`, url });
      else { await navigator.clipboard.writeText(url); setMsg('Enlace copiado'); setTimeout(() => setMsg(''), 2500); }
    } catch { /* el usuario cerró el menú de compartir */ }
  };
  return (
    <span className="flex items-center gap-2">
      {msg && <span className="text-xs font-semibold text-primary animate-in fade-in-0">{msg}</span>}
      <Button size="sm" className="rounded-full" onClick={invite}><Send /> Invitar</Button>
    </span>
  );
}

function Chat({ roomId, room, user, me }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  const left = useCooldown(me.lastMessageAt);
  const [openedAt] = useState(() => Date.now()); // hora al abrir (las reglas igual impiden escribir en una sala cerrada)
  const closed = room.expiresAt?.toMillis?.() < openedAt;

  useEffect(() => watchMessages(roomId, setMessages), [roomId]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages.length]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || left || busy) return;
    setBusy(true); setError('');
    try { await sendMessage(roomId, user, text); setText(''); }
    catch (err) {
      setError(err?.code === 'permission-denied' ? 'Espera a que termine el contador para volver a escribir.' : 'No se pudo enviar. Intenta de nuevo.');
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex max-h-[52vh] min-h-48 flex-col gap-2.5 overflow-y-auto rounded-2xl bg-secondary/50 p-3" aria-live="polite">
        {!messages.length && <li className="m-auto text-center text-sm text-muted-foreground">Nadie ha escrito aún. ¡Rompe el hielo! ⚽</li>}
        {messages.map((m) => {
          const mine = m.uid === user.uid;
          const canDelete = mine || room.ownerUid === user.uid;
          return (
            <li key={m.id} className={cn(ENTER, 'group flex items-end gap-2', mine && 'flex-row-reverse')}>
              {!mine && <Avatar person={m} />}
              <div className={cn('max-w-[78%] rounded-2xl px-3 py-2', mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-card')}>
                {!mine && <p className="text-xs font-bold text-primary">{m.name}</p>}
                <p className="text-sm break-words whitespace-pre-wrap">{m.text}</p>
                <p className={cn('mt-0.5 text-right text-2xs', mine ? 'text-primary-foreground/70' : 'text-faint')}>{hhmm(m.createdAt)}</p>
              </div>
              {canDelete && (
                <button type="button" onClick={() => deleteMessage(roomId, m.id).catch(() => {})} aria-label="Borrar mensaje"
                  className="mb-1 hidden size-6 place-items-center rounded-full text-xs text-faint hover:text-destructive group-hover:grid group-focus-within:grid">✕</button>
              )}
            </li>
          );
        })}
        <li ref={end} aria-hidden />
      </ol>

      {closed ? (
        <p className="rounded-2xl bg-secondary p-3 text-center text-sm text-muted-foreground">La sala está cerrada.</p>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MESSAGE_MAX))}
              placeholder={left ? `Podrás escribir en ${left} s` : 'Escribe un mensaje…'}
              disabled={Boolean(left)}
              maxLength={MESSAGE_MAX}
              aria-label="Mensaje"
              className="h-11 min-w-0 flex-1 rounded-full bg-secondary px-4 text-sm outline-none ring-primary/40 placeholder:text-faint focus:ring-2 disabled:opacity-60"
            />
            <Button type="submit" size="icon-touch" disabled={!text.trim() || Boolean(left) || busy} aria-label="Enviar"><Send /></Button>
          </div>
          <div className="flex justify-between px-2 text-2xs text-faint">
            <span>{left ? `Un mensaje cada ${MESSAGE_COOLDOWN_S} s · ${left} s` : `Un mensaje cada ${MESSAGE_COOLDOWN_S} s`}</span>
            <span className="tabular-nums">{text.length}/{MESSAGE_MAX}</span>
          </div>
          {error && <p role="alert" className="px-2 text-xs text-destructive">{error}</p>}
        </form>
      )}
    </div>
  );
}

/** Sala del partido: invitación, quiénes están y chat (las animaciones de los momentos las pone la página). */
export function RoomView({ roomId, matchId }) {
  const user = useUser();
  const router = useRouter();
  const path = usePathname();
  const [room, setRoom] = useState(undefined);
  const [me, setMe] = useState(undefined);
  const [members, setMembers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [openedAt] = useState(() => Date.now());

  useEffect(() => (user ? watchRoom(roomId, setRoom) : undefined), [user, roomId]);
  useEffect(() => (user ? watchMyMembership(roomId, user.uid, setMe) : undefined), [user, roomId]);
  useEffect(() => (user && me ? watchMembers(roomId, setMembers) : undefined), [user, me, roomId]);

  const card = 'flex flex-col gap-4 rounded-3xl bg-card p-5';
  if (user === undefined || (user && (room === undefined || me === undefined))) return <Skeleton className="h-64 rounded-3xl" />;

  if (!user) {
    return (
      <section className={cn(card, 'items-center text-center')}>
        <UserRound animate className="size-8 text-primary" aria-hidden />
        <p className="text-muted-foreground">Te invitaron a una sala para ver este partido. Entra a tu cuenta para unirte.</p>
        <Button asChild size="touch"><Link href={`/entrar?siguiente=${encodeURIComponent(path)}`}>Entrar y unirme</Link></Button>
      </section>
    );
  }
  if (!room || room.matchId !== String(matchId)) {
    return <section className={cn(card, 'items-center text-center text-muted-foreground')}>Esta sala no existe o ya no está disponible.</section>;
  }
  const closed = room.expiresAt?.toMillis?.() < openedAt;
  const isOwner = room.ownerUid === user.uid;

  const act = async (fn, after) => {
    setBusy(true); setError('');
    try { await fn(); after?.(); } catch (e) { console.warn(e.code ?? e); setError('No se pudo completar. Intenta de nuevo.'); } finally { setBusy(false); }
  };

  if (!me) {
    return (
      <section className={cn(card, 'items-center text-center')}>
        <p className="text-xs font-semibold tracking-wider text-faint uppercase">Sala de {room.ownerName}</p>
        <h2 className="text-xl font-black">{room.title}</h2>
        {closed
          ? <p className="text-muted-foreground">La sala ya cerró.</p>
          : <Button size="touch" disabled={busy} onClick={() => act(() => joinRoom(roomId, user))}>Unirme a la sala</Button>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </section>
    );
  }

  return (
    <section className={card} aria-label="Sala del partido">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-xs font-semibold tracking-wider text-faint uppercase">Sala de {room.ownerName}</span>
          <span className="flex items-center gap-1.5 pt-1">
            <span className="flex -space-x-2">{members.slice(0, 6).map((m) => <Avatar key={m.uid} person={m} size={26} />)}</span>
            <span className="text-sm text-muted-foreground">{members.length} {members.length === 1 ? 'persona' : 'personas'}</span>
          </span>
        </div>
        <InviteButton title={room.title} />
      </header>

      <Chat roomId={roomId} room={room} user={user} me={me} />

      <footer className="flex flex-wrap justify-end gap-2">
        {isOwner
          ? <Button variant="ghost" size="sm" disabled={busy} onClick={() => act(() => deleteRoom(roomId), () => router.replace(`/partido/${matchId}`))}>Cerrar la sala</Button>
          : <Button variant="ghost" size="sm" disabled={busy} onClick={() => act(() => leaveRoom(roomId, user.uid), () => router.replace(`/partido/${matchId}`))}><LogOut /> Salir de la sala</Button>}
      </footer>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
