'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Goal, Square, Newspaper } from 'lucide-react';
import { Flag } from '@/components/animate-ui/icons/flag';
import { Timer } from '@/components/animate-ui/icons/timer';
import { BellRing } from '@/components/animate-ui/icons/bell-ring';
import { BellOff } from '@/components/animate-ui/icons/bell-off';
import { AnimatedLink } from '@/components/ui/animated-link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/lib/firebase/useUser';
import { watchInbox, markRead } from '@/lib/firebase/db';
import { ago } from '@/lib/api/dates';
import { cn, ENTER, stagger } from '@/lib/utils';

const TYPES = {
  goal: { icon: Goal, cls: 'bg-primary text-primary-foreground' },
  card: { icon: Square, cls: 'bg-live/15 text-live' },
  kickoff: { icon: Timer, cls: 'bg-live/15 text-live' },
  final: { icon: Flag, cls: 'bg-accent text-foreground' },
  news: { icon: Newspaper, cls: 'bg-accent text-foreground' },
  reminder: { icon: BellRing, cls: 'bg-accent text-foreground' },
};

/** Bandeja de avisos del usuario (Firestore, en tiempo real). */
export function NotificationInbox() {
  const user = useUser();
  const [items, setItems] = useState(undefined);
  useEffect(() => (user ? watchInbox(user.uid, setItems) : undefined), [user]);

  if (user === undefined || (user && items === undefined)) {
    return <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-18 rounded-2xl" />)}</div>;
  }
  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center text-muted-foreground">
        <BellOff animate className="size-8 text-faint" aria-hidden />
        Entra a tu cuenta y elige tu equipo para recibir avisos de goles y noticias.
        <Button asChild size="touch"><Link href="/entrar">Entrar</Link></Button>
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
        <BellOff animate className="size-8 text-faint" aria-hidden />
        Aún no tienes avisos. Llegarán cuando juegue tu equipo o haya noticias suyas.
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((n, i) => {
        const { icon: Icon, cls } = TYPES[n.type] ?? TYPES.reminder;
        const external = /^https?:/.test(n.url ?? '');
        const body = (
          <>
            <span className={cn('grid size-10 flex-none place-items-center rounded-full', cls)}><Icon className="size-4.5" aria-hidden /></span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={cn('text-sm', n.read ? 'font-semibold' : 'font-extrabold')}>{n.title}</span>
              {n.text && <span className="text-md text-muted-foreground">{n.text}</span>}
              <span className="text-xs text-faint">{n.createdAt?.toDate ? ago(n.createdAt.toDate().toISOString()) : ''}</span>
            </span>
            {!n.read && <span className="mt-1.5 size-2 flex-none animate-pulse-live rounded-full bg-primary" aria-label="Sin leer" />}
          </>
        );
        const cardCls = 'flex items-start gap-3.5 rounded-2xl bg-card p-3.5 transition-[background-color,transform] hover:bg-secondary hover:text-inherit';
        const onClick = () => { if (!n.read) markRead(user.uid, n.id).catch(() => {}); };
        return (
          <li key={n.id} className={ENTER} style={stagger(i)}>
            {external
              ? <a href={n.url} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cardCls}>{body}</a>
              : <AnimatedLink href={n.url || '/'} onClick={onClick} className={cardCls}>{body}</AnimatedLink>}
          </li>
        );
      })}
    </ul>
  );
}
