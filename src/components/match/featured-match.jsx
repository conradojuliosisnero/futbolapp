import Link from 'next/link';
import { Play } from '@/components/animate-ui/icons/play';
import { Button } from '@/components/ui/button';
import { LiveBadge } from '@/components/ui/live-badge';
import { TeamCrest } from '@/components/ui/team-crest';
import { Media } from '@/components/ui/media';
import { Eyebrow } from '@/components/ui/eyebrow';
import { FollowToggle } from './follow-toggle';

export function FeaturedMatch({ match, image }) {
  const { home, away, score, scorers } = match;
  const team = 'flex flex-col items-start gap-1.5 text-[15px] font-bold md:flex-row md:items-center md:gap-3 md:text-[22px] md:font-extrabold';

  return (
    <article className="relative h-80 overflow-hidden rounded-4xl md:h-110">
      <Media src={image} label="imagen de estadio / jugada" className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent from-25% to-overlay" />
      {match.status === 'live' && <div className="absolute top-3.5 right-3.5 md:top-5 md:right-5"><LiveBadge>{match.minute}</LiveBadge></div>}

      <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3.5 md:inset-x-9 md:bottom-8 md:flex-row md:items-end md:justify-between md:gap-8">
        <div className="flex flex-col gap-3.5 md:gap-4.5">
          <Eyebrow tone="primary">{match.league} · {match.round}</Eyebrow>
          <div className="flex items-center justify-between gap-3 md:justify-start md:gap-7">
            <div className={team}><TeamCrest team={home} /><span>{home.name}</span></div>
            <div className="text-score-lg leading-none font-black tracking-tight whitespace-nowrap md:text-display">
              {score
                ? <>{score[0]}<span className="px-1.5 text-neutral-2 md:px-2.5">–</span>{score[1]}</>
                : <span className="text-neutral-2">{match.kickoff ?? 'vs'}</span>}
            </div>
            <div className={`${team} items-end text-right md:flex-row-reverse`}><TeamCrest team={away} /><span>{away.name}</span></div>
          </div>
          {scorers && <p className="hidden text-sm text-muted-foreground md:block">{scorers.home.join(', ')} · {scorers.away.join(', ')}</p>}
        </div>
        <div className="flex gap-2.5">
          <Button asChild size="touch" className="flex-1 md:flex-none">
            <Link href={`/partido/${match.id}`}><Play className="fill-current" /> Ver en vivo</Link>
          </Button>
          <FollowToggle />
        </div>
      </div>
    </article>
  );
}
