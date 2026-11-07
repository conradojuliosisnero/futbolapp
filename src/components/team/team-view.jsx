import Link from 'next/link';
import { SectionTabs } from '@/components/ui/section-tabs';
import { TeamCrest } from '@/components/ui/team-crest';
import { Eyebrow } from '@/components/ui/eyebrow';
import { StandingsTable, FormGuide } from '@/components/league/standings-table';
import { MatchRow } from '@/components/match/match-list';
import { cn, ENTER, stagger } from '@/lib/utils';

function MatchSection({ title, matches, empty }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wider text-faint uppercase">{title}</h3>
      {matches.length
        ? matches.map((m, i) => <MatchRow key={m.id} match={m} index={i} highlighted={m.status === 'live'} />)
        : <p className="text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}

function Squad({ squad }) {
  if (!squad.length) return <p className="py-6 text-center text-muted-foreground">Plantilla no disponible.</p>;
  return (
    <div className="flex flex-col gap-5">
      {squad.map((g) => (
        <section key={g.group} className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold tracking-wider text-faint uppercase">{g.group} · {g.players.length}</h3>
          <ul className="flex flex-col overflow-hidden rounded-2xl bg-card">
            {g.players.map((p, i) => (
              <li key={p.id} style={stagger(i)} className={cn(ENTER, 'flex items-center gap-3 border-b px-4 py-3 last:border-b-0')}>
                <span className="grid size-9 flex-none place-items-center rounded-full bg-secondary text-sm font-black text-subtle">{p.number ?? '·'}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-bold">{p.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{[p.position, p.nationality].filter(Boolean).join(' · ')}</span>
                </span>
                {p.age != null && <span className="text-xs font-semibold text-faint tabular-nums">{p.age} años</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Ficha completa de un equipo: datos, forma, partidos, plantilla y tabla. */
export function TeamView({ data, note }) {
  const { team, league, position, standing: s, form, standings, live, upcoming, results, squad } = data;
  const facts = [['Fundado', team.founded], ['Estadio', team.venue], ['Entrenador', team.coach], ['Colores', team.colors]].filter(([, v]) => v);
  const stats = s ? [['PJ', s.played], ['G', s.won], ['E', s.drawn], ['P', s.lost], ['Pts', s.pts]] : [];

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <header className="flex flex-col gap-5 rounded-4xl bg-card p-5 md:p-7">
        <div className="flex items-center gap-4">
          <TeamCrest team={team} size={64} />
          <div className="flex min-w-0 flex-col gap-1.5">
            {league && (
              <Eyebrow tone="primary">
                {league.inApp ? <Link href={`/ligas/${league.id}`}>{league.name}</Link> : league.name}
                {position && ` · ${position}º lugar`}
              </Eyebrow>
            )}
            <h1 className="text-[26px] leading-none font-black tracking-tight md:text-[32px]">{team.name}</h1>
          </div>
        </div>
        {stats.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {stats.map(([label, value]) => (
              <div key={label} className="flex flex-col items-center gap-0.5 rounded-xl bg-secondary py-2.5">
                <span className="text-xl font-black tabular-nums">{value}</span>
                <span className="text-xs font-semibold text-faint">{label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-3 text-md font-semibold text-muted-foreground">
          Últimos 5 <FormGuide form={form} />
        </div>
        {facts.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-xs font-semibold text-faint">{k}</dt>
                <dd className="truncate font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <SectionTabs
        label={`Secciones de ${team.name}`}
        items={[
          {
            value: 'matches',
            label: 'Partidos',
            content: (
              <div className="flex flex-col gap-5">
                {live.length > 0 && <MatchSection title="En vivo" matches={live} />}
                <MatchSection title="Próximos" matches={upcoming} empty="Sin partidos programados en los próximos días." />
                <MatchSection title="Resultados" matches={results} empty="Sin resultados recientes." />
              </div>
            ),
          },
          { value: 'squad', label: 'Plantilla', content: <Squad squad={squad} /> },
          {
            value: 'table',
            label: 'Tabla',
            content: standings.length
              ? <StandingsTable rows={standings} highlight={team.id} />
              : <p className="py-6 text-center text-muted-foreground">Tabla no disponible para esta competición.</p>,
          },
        ]}
      />
      {note}
    </div>
  );
}
