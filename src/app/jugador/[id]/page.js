import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { TeamCrest } from '@/components/ui/team-crest';
import { getPlayer, getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';
import { cn, ENTER, stagger } from '@/lib/utils';

const fmtDate = (d) => new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(d));

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await getPlayer(id);
  return p ? { title: `${p.name} · ${siteConfig.name}` } : {};
}

export default async function PlayerPage({ params, searchParams }) {
  const [{ id }, { equipo }] = await Promise.all([params, searchParams]);
  const [p, liveCount] = await Promise.all([getPlayer(id), getLiveCount()]);
  if (!p) notFound();
  const teamId = /^\d+$/.test(equipo ?? '') ? equipo : null; // viene de la URL: solo se acepta un número

  const facts = [
    ['Posición', p.position], ['Dorsal', p.number], ['Edad', p.age && `${p.age} años`],
    ['Nacimiento', p.birthDate && fmtDate(p.birthDate)], ['Lugar', p.birthPlace], ['Nacionalidad', p.nationality],
    ['Altura', p.height], ['Peso', p.weight],
  ].filter(([, v]) => v != null && v !== '');

  return (
    <AppShell active="ligas" counts={{ live: liveCount }}>
      <div className="flex max-w-2xl flex-col gap-5">
        {teamId && (
          <Link href={`/equipo/${teamId}`} className="flex items-center gap-2 text-sm font-medium text-subtle">
            ← <TeamCrest team={{ crest: `https://crests.football-data.org/${teamId}.png` }} size={18} /> Volver al equipo
          </Link>
        )}
        <header className="flex flex-col items-center gap-4 rounded-4xl bg-card p-6 text-center md:flex-row md:text-left">
          <PlayerAvatar player={p} size={112} ring="ring-4 ring-primary/40" />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">{[p.position, p.number != null && `#${p.number}`].filter(Boolean).join(' · ')}</span>
            <h1 className="text-[28px] leading-none font-black tracking-tight md:text-[34px]">{p.name}</h1>
            {p.fullName && p.fullName !== p.name && <span className="text-sm text-muted-foreground">{p.fullName}</span>}
          </div>
        </header>

        <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {facts.map(([k, v], i) => (
            <div key={k} style={stagger(i)} className={cn(ENTER, 'flex flex-col gap-1 rounded-2xl bg-card p-4')}>
              <dt className="text-xs font-semibold text-faint">{k}</dt>
              <dd className="text-sm font-bold">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="rounded-2xl bg-secondary p-4 text-center text-md text-muted-foreground">
          Las estadísticas de la temporada actual (goles, asistencias, minutos) no están disponibles en el plan gratis de la API.
        </p>
      </div>
    </AppShell>
  );
}
