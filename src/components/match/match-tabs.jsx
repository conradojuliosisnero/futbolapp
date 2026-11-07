import { SectionTabs } from '@/components/ui/section-tabs';
import { SplitBar } from '@/components/ui/split-bar';
import { Media } from '@/components/ui/media';
import { cn } from '@/lib/utils';

function Timeline({ events = [] }) {
  return (
    <ol>
      {events.map((e, i) => {
        const hot = e.type === 'goal';
        const card = e.type === 'yellow' || e.type === 'red';
        return (
          <li key={`${e.min}-${i}`} className="grid grid-cols-[44px_1fr] gap-3 border-b py-3.5 last:border-b-0">
            <span className={cn('text-sm font-bold', hot ? 'font-extrabold text-primary' : 'text-subtle')}>{e.min}</span>
            <div className="flex min-w-0 flex-col gap-2">
              <div className={cn('flex items-center gap-2 font-semibold', hot ? 'text-base font-extrabold' : 'text-[15px]')}>
                {card && <span className={cn('h-3.5 w-2.5 flex-none rounded-xs', e.type === 'yellow' ? 'bg-warning' : 'bg-live')} aria-hidden />}
                {e.title}
              </div>
              {e.text && <p className="text-sm leading-snug text-muted-foreground">{e.text}</p>}
              {e.clip && <div className="h-24"><Media src={e.clipThumb} label="clip repetición" className="rounded-lg" /></div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StatsList({ stats = [] }) {
  return (
    <div className="flex flex-col gap-4.5 pt-1">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-2">
          <div className="flex justify-between text-[15px] font-extrabold">
            <span>{s.home}</span><span className="text-md font-medium text-muted-foreground">{s.label}</span><span>{s.away}</span>
          </div>
          <SplitBar segments={[{ value: s.home, tone: 'primary' }, { value: s.away, tone: 'neutral-1' }]} />
        </div>
      ))}
    </div>
  );
}

function Lineups({ match }) {
  const { lineups, home, away } = match;
  if (!lineups) return <p className="text-muted-foreground">Alineaciones no disponibles.</p>;
  return (
    <div className="grid grid-cols-2 gap-4">
      {[[home, lineups.home], [away, lineups.away]].map(([team, players]) => (
        <div key={team.code} className="flex flex-col gap-2.5">
          <div className="text-sm font-extrabold">{team.name}</div>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
            {players.map((p) => <li key={p}>{p}</li>)}
          </ol>
        </div>
      ))}
    </div>
  );
}

export function MatchTabs({ match, defaultTab = 'events' }) {
  const empty = <p className="text-muted-foreground">El partido aún no empieza.</p>;
  return (
    <SectionTabs
      label="Detalle del partido"
      defaultValue={defaultTab}
      items={[
        { value: 'events', label: 'Jugadas', content: match.events?.length ? <Timeline events={match.events} /> : empty },
        { value: 'stats', label: 'Estadísticas', content: match.stats?.length ? <StatsList stats={match.stats} /> : empty },
        { value: 'lineups', label: 'Alineación', content: <Lineups match={match} /> },
      ]}
    />
  );
}
