import { LiveBadge } from '@/components/ui/live-badge';
import { cn } from '@/lib/utils';

// "67'" → 67 · "45'+4'" → 45 · "MT" → 45
const minuteNumber = (m) => (m === 'MT' ? 45 : parseInt(m, 10) || 0);

function period(match) {
  if (match.status === 'finished') return 'Final del partido';
  if (match.status === 'scheduled') return match.label === match.kickoff ? 'Por comenzar' : match.label; // Aplaz./Canc.
  if (match.minute === 'MT') return 'Entretiempo';
  const n = minuteNumber(match.minute);
  return n > 90 ? 'Tiempo extra' : n > 45 || /^(4[6-9]|[5-9]\d)/.test(match.minute) ? 'Segundo tiempo' : 'Primer tiempo';
}

function countdown(utc) {
  const mins = Math.round((utc - Date.now()) / 60000);
  if (mins <= 0) return 'En instantes';
  if (mins < 60) return `Empieza en ${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h < 24 ? `Empieza en ${h} h${m ? ` ${m} min` : ''}` : null;
}

/** Contador grande del partido (reemplaza la transmisión): minuto, tiempo de juego y barra de progreso. */
export function MatchClock({ match }) {
  const live = match.status === 'live';
  const big = live ? match.minute : match.status === 'finished' ? 'Final' : match.kickoff;
  const pct = match.status === 'finished' ? 100 : live ? Math.min(100, (minuteNumber(match.minute) / 90) * 100) : 0;
  const sub = match.status === 'scheduled' ? [match.day ?? 'Hoy', countdown(match.utc)].filter(Boolean).join(' · ') : period(match);

  return (
    <section
      aria-label="Tiempo del partido"
      className="relative flex flex-col items-center gap-3 overflow-hidden rounded-4xl bg-card px-6 py-8 text-center md:py-10"
    >
      {live && <div className="absolute top-4 right-4"><LiveBadge /></div>}
      <span className="text-xs font-semibold tracking-wider text-faint uppercase">{live ? 'Minuto' : match.status === 'finished' ? 'Terminado' : 'Inicio'}</span>
      <span
        key={big}
        aria-live="polite"
        className={cn(
          'text-[88px] leading-none font-black tracking-tight tabular-nums md:text-[120px] animate-in fade-in-0 zoom-in-95 duration-300 motion-reduce:animate-none',
          live ? 'text-primary' : 'text-foreground',
        )}
      >
        {big}
      </span>
      <span className="text-sm font-semibold text-muted-foreground">{sub}</span>

      {match.status !== 'scheduled' && (
        <div className="mt-2 w-full max-w-md">
          <div className="relative h-2 overflow-hidden rounded-full bg-input">
            <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-background" aria-hidden />
          </div>
          <div className="mt-1.5 flex justify-between text-2xs font-semibold text-faint">
            <span>0&apos;</span><span>MT</span><span>90&apos;</span>
          </div>
        </div>
      )}
    </section>
  );
}
