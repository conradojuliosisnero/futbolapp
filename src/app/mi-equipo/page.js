import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { SectionTabs } from '@/components/ui/section-tabs';
import { TeamCrest } from '@/components/ui/team-crest';
import { Eyebrow } from '@/components/ui/eyebrow';
import { StandingsTable, FormGuide } from '@/components/league/standings-table';
import { MatchRow } from '@/components/match/match-list';
import { getTeamOverview, getLiveCount } from '@/lib/api/matches';
import { DEFAULT_TEAM } from '@/config/leagues';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Mi equipo · ${siteConfig.name}` };

const ORDER = { live: 0, scheduled: 1, finished: 2 };

export default async function MyTeamPage() {
  const [data, liveCount] = await Promise.all([getTeamOverview(DEFAULT_TEAM.id, DEFAULT_TEAM.league), getLiveCount()]);

  if (!data) {
    return (
      <AppShell active="mi-equipo" counts={{ live: liveCount }}>
        <p className="py-10 text-center text-muted-foreground">Aún no sigues a ningún equipo.</p>
      </AppShell>
    );
  }

  const { team, league, position, standing: s, form, standings, matches } = data;
  const sorted = [...matches].sort((a, b) => ORDER[a.status] - ORDER[b.status] || (a.status === 'finished' ? b.utc - a.utc : a.utc - b.utc));
  const stats = s ? [['PJ', s.played], ['G', s.won], ['E', s.drawn], ['P', s.lost], ['Pts', s.pts]] : [];

  return (
    <AppShell active="mi-equipo" counts={{ live: liveCount }}>
      <div className="flex max-w-3xl flex-col gap-5">
        <header className="flex flex-col gap-5 rounded-4xl bg-card p-5 md:p-7">
          <div className="flex items-center gap-4">
            <TeamCrest team={team} size="lg" />
            <div className="flex flex-col gap-1.5">
              <Eyebrow tone="primary">{[league.name, position && `${position}º lugar`].filter(Boolean).join(' · ')}</Eyebrow>
              <h1 className="text-[26px] leading-none font-black tracking-tight md:text-[32px]">{team.name}</h1>
            </div>
          </div>
          {stats.length > 0 && <div className="grid grid-cols-5 gap-2">
            {stats.map(([label, value]) => (
              <div key={label} className="flex flex-col items-center gap-0.5 rounded-xl bg-secondary py-2.5">
                <span className="text-xl font-black tabular-nums">{value}</span>
                <span className="text-xs font-semibold text-faint">{label}</span>
              </div>
            ))}
          </div>}
          <div className="flex items-center justify-between gap-3 text-md font-semibold text-muted-foreground">
            Últimos 5 <FormGuide form={form} />
          </div>
        </header>

        <SectionTabs
          label="Secciones del equipo"
          items={[
            {
              value: 'matches',
              label: 'Partidos',
              content: <div className="flex flex-col gap-2">{sorted.map((m, i) => <MatchRow key={m.id} match={m} index={i} highlighted={m.status === 'live'} />)}</div>,
            },
            { value: 'table', label: 'Tabla', content: <StandingsTable rows={standings} highlight={team.id} /> },
          ]}
        />

        <p className="text-center text-xs text-faint">
          Equipo por defecto. Podrás elegir el tuyo al <Link href="/entrar" className="text-primary">iniciar sesión</Link>.
        </p>
      </div>
    </AppShell>
  );
}
