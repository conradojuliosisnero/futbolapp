import { Goal, ArrowLeftRight } from 'lucide-react';
import { SectionTabs } from '@/components/ui/section-tabs';
import { LineupPitch } from './lineup-pitch';
import { SplitBar } from '@/components/ui/split-bar';
import { Media } from '@/components/ui/media';
import { cn, ENTER, stagger } from '@/lib/utils';

/** Relato minuto a minuto (ESPN, en español). */
function Commentary({ items }) {
  return (
    <ol className="flex flex-col">
      {items.map((c, i) => (
        <li key={i} style={stagger(i)} className={cn(ENTER, 'grid grid-cols-[44px_1fr] gap-3 border-b py-3 last:border-b-0')}>
          <span className="text-sm font-bold text-subtle">{c.min}</span>
          <p className="text-sm leading-snug text-muted-foreground">{c.text}</p>
        </li>
      ))}
    </ol>
  );
}

function Timeline({ events = [] }) {
  return (
    <ol>
      {events.map((e, i) => {
        const hot = e.type === 'goal';
        const card = e.type === 'yellow' || e.type === 'red';
        return (
          <li key={`${e.min}-${i}`} style={stagger(i)} className={cn(ENTER, 'grid grid-cols-[44px_1fr] gap-3 border-b py-3.5 last:border-b-0')}>
            <span className={cn('text-sm font-bold', hot ? 'font-extrabold text-primary' : 'text-subtle')}>{e.min}</span>
            <div className="flex min-w-0 flex-col gap-2">
              <div className={cn('flex items-center gap-2 font-semibold', hot ? 'text-base font-extrabold' : 'text-[15px]')}>
                {card && <span className={cn('h-3.5 w-2.5 flex-none rounded-xs', e.type === 'yellow' ? 'bg-warning' : 'bg-live')} aria-hidden />}
                {(e.type === 'goal' || e.type === 'goal-against') && <Goal aria-hidden className={cn('size-4 flex-none', hot ? 'text-primary' : 'text-subtle')} />}
                {e.type === 'sub' && <ArrowLeftRight aria-hidden className="size-4 flex-none text-subtle" />}
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
  if (!match.lineups) {
    return <p className="text-muted-foreground">{match.status === 'scheduled'
      ? 'Las alineaciones se publican cerca de una hora antes del partido.' : 'Alineaciones no disponibles para este partido.'}</p>;
  }
  return <LineupPitch lineups={match.lineups} homeName={match.home.name} awayName={match.away.name} />;
}

export function MatchTabs({ match, defaultTab = 'events' }) {
  const note = (t) => <p className="text-muted-foreground">{t}</p>;
  const empty = note(match.status === 'scheduled' ? 'El partido aún no empieza.'
    : match.status === 'live' ? 'Sin jugadas todavía. Se actualizan cada 15 minutos.' : 'Jugadas no disponibles para este partido.');
  return (
    <SectionTabs
      label="Detalle del partido"
      defaultValue={defaultTab}
      items={[
        { value: 'events', label: 'Jugadas', content: match.events?.length ? <Timeline events={match.events} /> : empty },
        ...(match.commentary?.length ? [{ value: 'commentary', label: 'Relato', content: <Commentary items={match.commentary} /> }] : []),
        { value: 'stats', label: 'Estadísticas', content: match.stats?.length ? <StatsList stats={match.stats} /> : note(match.status === 'scheduled' ? 'El partido aún no empieza.' : 'Estadísticas no disponibles para este partido.') },
        { value: 'lineups', label: 'Alineación', content: <Lineups match={match} /> },
      ]}
    />
  );
}
