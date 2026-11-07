import { TeamCrest } from '@/components/ui/team-crest';
import { cn } from '@/lib/utils';

function Side({ team, reverse }) {
  return (
    <div className={cn('flex items-center gap-3.5 text-[15px] font-bold', reverse && 'flex-row-reverse')}>
      <span className="hidden md:inline-flex"><TeamCrest team={team} /></span>
      <span className="hidden text-xl font-extrabold md:inline">{team.name}</span>
      <span className="md:hidden">{team.code}</span>
    </div>
  );
}

export function Scoreboard({ match }) {
  return (
    <div className="flex items-center justify-between md:rounded-[22px] md:bg-card md:px-7 md:py-5">
      <Side team={match.home} />
      <div className="flex flex-col items-center gap-0.5">
        {match.score
          ? <div className="text-score leading-none font-black md:text-5xl">{match.score[0]} – {match.score[1]}</div>
          : <div className="text-score leading-none font-black text-subtle md:text-5xl">{match.kickoff ?? 'vs'}</div>}
        {match.clock && <div className="text-xs font-semibold text-primary md:text-md">{match.clock}</div>}
      </div>
      <Side team={match.away} reverse />
    </div>
  );
}
