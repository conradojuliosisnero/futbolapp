import Link from 'next/link';
import { TeamCrest } from '@/components/ui/team-crest';
import { cn, ENTER, stagger } from '@/lib/utils';

/** Goleadores de la liga. rows: [{ player, nationality, team, goals, assists, penalties }] */
export function ScorersTable({ rows }) {
  if (!rows.length) return <p className="py-6 text-center text-muted-foreground">Goleadores no disponibles para esta competición.</p>;
  return (
    <ol className="flex flex-col overflow-hidden rounded-2xl bg-card">
      {rows.map((r, i) => (
        <li key={`${r.player}-${r.team.id}`} style={stagger(i)} className={cn(ENTER, 'flex items-center gap-3 border-b px-4 py-3 last:border-b-0')}>
          <span className={cn('w-5 text-sm font-bold tabular-nums', i === 0 ? 'text-primary' : 'text-subtle')}>{i + 1}</span>
          <Link href={`/equipo/${r.team.id}`} aria-label={r.team.name}><TeamCrest team={r.team} size="sm" /></Link>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-bold">{r.player}</span>
            <Link href={`/equipo/${r.team.id}`} className="truncate text-xs text-muted-foreground">{r.team.name}</Link>
          </span>
          <span className="flex flex-col items-end">
            <span className="text-lg font-black tabular-nums">{r.goals}</span>
            <span className="text-2xs text-faint">{r.assists} asist.{r.penalties ? ` · ${r.penalties} pen.` : ''}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
