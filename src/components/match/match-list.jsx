import { Bell } from '@/components/animate-ui/icons/bell';
import { SectionHeader } from '@/components/ui/section-header';
import { Eyebrow } from '@/components/ui/eyebrow';
import { AnimatedLink } from '@/components/ui/animated-link';
import { cn, ENTER, stagger } from '@/lib/utils';

export function MatchRow({ match, highlighted, index }) {
  const live = match.status === 'live';
  return (
    <AnimatedLink
      href={`/partido/${match.id}`}
      style={index != null ? stagger(index) : undefined}
      className={cn(
        index != null && ENTER,
        'grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-2xl bg-card p-3.5 transition-[background-color,transform] hover:bg-secondary hover:text-inherit',
        highlighted && 'bg-secondary ring-[1.5px] ring-primary ring-inset',
      )}
    >
      <span className={cn('text-md font-bold', live ? 'text-live' : 'text-subtle')}>{live ? match.minute : match.kickoff}</span>
      <span className="flex flex-col gap-1 text-sm font-semibold">
        <span>{match.home.name}</span>
        <span className="text-muted-foreground">{match.away.name}</span>
      </span>
      {match.score
        ? <span className="flex flex-col gap-1 text-right text-sm font-extrabold"><span>{match.score[0]}</span><span>{match.score[1]}</span></span>
        : <span className="flex items-center gap-1 text-xs font-semibold text-primary"><Bell className="size-3.5" aria-hidden />Recordar</span>}
    </AnimatedLink>
  );
}

export function MatchList({ title, date, groups, highlightId }) {
  return (
    <section className="flex flex-col gap-5">
      <SectionHeader title={title} meta={date} />
      {groups.map((g) => (
        <div key={g.league} className="flex flex-col gap-2">
          <Eyebrow>{g.league}</Eyebrow>
          {g.matches.map((m, i) => <MatchRow key={m.id} match={m} index={i} highlighted={m.id === highlightId} />)}
        </div>
      ))}
    </section>
  );
}
