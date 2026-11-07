import Link from 'next/link';
import { Goal, Flag, Timer, BellRing, Square, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPES = {
  goal: { icon: Goal, cls: 'bg-primary text-primary-foreground' },
  card: { icon: Square, cls: 'bg-warning/15 text-warning' },
  kickoff: { icon: Timer, cls: 'bg-live/15 text-live' },
  final: { icon: Flag, cls: 'bg-accent text-foreground' },
  reminder: { icon: BellRing, cls: 'bg-accent text-foreground' },
};

export function NotificationList({ items }) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
        <BellOff className="size-8 text-faint" aria-hidden />
        No tienes notificaciones todavía.
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((n) => {
        const { icon: Icon, cls } = TYPES[n.type] ?? TYPES.reminder;
        return (
          <li key={n.id}>
            <Link href={n.url} className="flex items-start gap-3.5 rounded-2xl bg-card p-3.5 transition-colors hover:bg-secondary hover:text-inherit">
              <span className={cn('grid size-10 flex-none place-items-center rounded-full', cls)}><Icon className="size-4.5" aria-hidden /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={cn('text-sm', n.read ? 'font-semibold' : 'font-extrabold')}>{n.title}</span>
                <span className="text-md text-muted-foreground">{n.text}</span>
                <span className="text-xs text-faint">{n.time}</span>
              </span>
              {!n.read && <span className="mt-1.5 size-2 flex-none rounded-full bg-primary" aria-label="Sin leer" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
