import Link from 'next/link';
import { TeamCrest } from '@/components/ui/team-crest';
import { cn } from '@/lib/utils';

function Side({ team, reverse }) {
  const cls = cn('flex items-center gap-3.5 text-[15px] font-bold transition-colors', reverse && 'flex-row-reverse');
  const body = (
    <>
      <span className="hidden md:inline-flex"><TeamCrest team={team} /></span>
      <span className="hidden text-xl font-extrabold md:inline">{team.name}</span>
      <span className="md:hidden">{team.code}</span>
    </>
  );
  // Sin id real (partido de prueba) no hay página de equipo a la cual ir.
  return team.id
    ? <Link href={`/equipo/${team.id}`} className={cn(cls, 'hover:text-primary')}>{body}</Link>
    : <span className={cls}>{body}</span>;
}

export function Scoreboard({ match }) {
  return (
    <div className="flex items-center justify-between md:rounded-[22px] md:bg-card md:px-7 md:py-5">
      <Side team={match.home} />
      <div className="flex flex-col items-center gap-0.5">
        {match.score
          ? <div key={match.score.join('-')} className="text-score leading-none font-black tabular-nums md:text-5xl animate-in zoom-in-90 duration-300 motion-reduce:animate-none">{match.score[0]} – {match.score[1]}</div>
          : <div className="text-3xl leading-none font-black text-subtle md:text-4xl">vs</div>}
      </div>
      <Side team={match.away} reverse />
    </div>
  );
}
