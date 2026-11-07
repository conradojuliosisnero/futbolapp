import { TeamCrest } from '@/components/ui/team-crest';
import { cn, ENTER, stagger } from '@/lib/utils';

const FORM = { G: 'bg-primary text-primary-foreground', E: 'bg-neutral-2', P: 'bg-live text-live-foreground' };

/** Últimos resultados: 'GGEPG' → cuadritos G/E/P */
export function FormGuide({ form }) {
  if (!form) return <span className="text-faint">—</span>;
  return (
    <span className="inline-flex gap-1" aria-label={`Últimos partidos: ${form}`}>
      {[...form].map((r, i) => (
        <span key={i} className={cn('grid size-5 place-items-center rounded-md text-2xs font-bold', FORM[r])} aria-hidden>{r}</span>
      ))}
    </span>
  );
}

/** rows: [{ team, played, gd, pts, form }] · highlight: id del equipo a resaltar */
export function StandingsTable({ rows, highlight }) {
  const num = 'px-1.5 text-center tabular-nums';
  return (
    <div className="overflow-x-auto rounded-2xl bg-card px-2 md:px-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-faint">
            <th className="w-8 py-3 text-left font-semibold">#</th>
            <th className="py-3 text-left font-semibold">Equipo</th>
            <th className={cn(num, 'font-semibold')}>PJ</th>
            <th className={cn(num, 'font-semibold')}>DG</th>
            <th className="hidden px-2 font-semibold md:table-cell">Últimos 5</th>
            <th className={cn(num, 'font-semibold')}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.team.id ?? r.team.code} style={stagger(i)} className={cn(ENTER, 'border-t transition-colors hover:bg-secondary/60', r.team.id === highlight && 'bg-secondary')}>
              <td className={cn('py-3 font-bold', i === 0 ? 'text-primary' : 'text-subtle')}>{i + 1}</td>
              <td className="py-3">
                <span className="flex items-center gap-2.5 font-semibold">
                  <TeamCrest team={r.team} size="sm" />
                  <span className="hidden sm:inline">{r.team.name}</span>
                  <span className="sm:hidden">{r.team.code}</span>
                </span>
              </td>
              <td className={cn(num, 'text-muted-foreground')}>{r.played}</td>
              <td className={cn(num, 'text-muted-foreground')}>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
              <td className="hidden px-2 text-center md:table-cell"><FormGuide form={r.form} /></td>
              <td className={cn(num, 'font-extrabold')}>{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
