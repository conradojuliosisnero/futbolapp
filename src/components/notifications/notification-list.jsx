import { Goal, Square } from 'lucide-react';
import { Flag } from '@/components/animate-ui/icons/flag';
import { Timer } from '@/components/animate-ui/icons/timer';
import { BellRing } from '@/components/animate-ui/icons/bell-ring';
import { BellOff } from '@/components/animate-ui/icons/bell-off';
import { AnimatedLink } from '@/components/ui/animated-link';
import { cn, ENTER, stagger } from '@/lib/utils';

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
        <BellOff animate className="size-8 text-faint" aria-hidden />
        No tienes notificaciones todavía.
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((n, i) => {
        const { icon: Icon, cls } = TYPES[n.type] ?? TYPES.reminder;
        return (
          <li key={n.id} className={ENTER} style={stagger(i)}>
            <AnimatedLink href={n.url} className="flex items-start gap-3.5 rounded-2xl bg-card p-3.5 transition-[background-color,transform] hover:bg-secondary hover:text-inherit">
              <span className={cn('grid size-10 flex-none place-items-center rounded-full', cls)}><Icon className="size-4.5" aria-hidden /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={cn('text-sm', n.read ? 'font-semibold' : 'font-extrabold')}>{n.title}</span>
                <span className="text-md text-muted-foreground">{n.text}</span>
                <span className="text-xs text-faint">{n.time}</span>
              </span>
              {!n.read && <span className="mt-1.5 size-2 flex-none animate-pulse-live rounded-full bg-primary" aria-label="Sin leer" />}
            </AnimatedLink>
          </li>
        );
      })}
    </ul>
  );
}
