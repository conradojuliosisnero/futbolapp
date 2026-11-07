import { cn } from '@/lib/utils';

const shortName = (n = '') => n.split(' ').slice(-1)[0];

/** Agrupa titulares por fila según la grilla de API-Football ("fila:columna", fila 1 = arquero). */
function rowsOf(players) {
  const rows = {};
  for (const p of players) {
    const [r, c] = (p.grid ?? '').split(':').map(Number);
    (rows[r || 99] ??= []).push({ ...p, col: c || 0 });
  }
  return Object.keys(rows).map(Number).sort((a, b) => a - b).map((r) => rows[r].sort((a, b) => a.col - b.col));
}

function Player({ p, away }) {
  return (
    <span className="flex w-16 flex-col items-center gap-1 text-center">
      <span className={cn('grid size-8 place-items-center rounded-full text-xs font-black shadow-md', away ? 'bg-foreground text-background' : 'bg-primary text-primary-foreground')}>
        {p.number ?? ''}
      </span>
      <span className="line-clamp-1 text-2xs font-semibold text-foreground/90">{shortName(p.name)}</span>
    </span>
  );
}

function Half({ side, away }) {
  // Local de arriba hacia el centro (arquero arriba); visitante al revés (arquero abajo).
  const rows = rowsOf(side.startXI);
  const ordered = away ? [...rows].reverse() : rows;
  return (
    <div className="flex flex-1 flex-col justify-around gap-3 py-3">
      {ordered.map((row, i) => (
        <div key={i} className={cn('flex justify-around', away && 'flex-row-reverse')}>
          {row.map((p) => <Player key={`${p.number}-${p.name}`} p={p} away={away} />)}
        </div>
      ))}
    </div>
  );
}

function Bench({ title, side }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wider text-faint uppercase">{title} · {side.formation}</h3>
      {side.coach && <p className="text-sm"><span className="text-faint">DT</span> <span className="font-semibold">{side.coach}</span></p>}
      <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        {side.subs.map((p) => <li key={`${p.number}-${p.name}`}><span className="inline-block w-6 font-bold text-subtle tabular-nums">{p.number}</span>{p.name} <span className="text-2xs text-faint">{p.pos}</span></li>)}
      </ul>
    </div>
  );
}

/** Cancha con las dos alineaciones + suplentes y entrenador. lineups: { home, away } */
export function LineupPitch({ lineups, homeName, awayName }) {
  return (
    <div className="flex flex-col gap-5">
      <div
        className="relative flex aspect-[3/4] max-h-[640px] flex-col overflow-hidden rounded-3xl border bg-secondary"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 12.5%, rgba(255,255,255,.025) 12.5% 25%)' }}
      >
        {/* líneas de la cancha */}
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-foreground/10" aria-hidden />
        <span className="pointer-events-none absolute top-1/2 left-1/2 size-24 -translate-1/2 rounded-full border border-foreground/10" aria-hidden />
        <span className="pointer-events-none absolute top-0 left-1/2 h-[14%] w-[44%] -translate-x-1/2 border-x border-b border-foreground/10" aria-hidden />
        <span className="pointer-events-none absolute bottom-0 left-1/2 h-[14%] w-[44%] -translate-x-1/2 border-x border-t border-foreground/10" aria-hidden />
        <Half side={lineups.home} />
        <Half side={lineups.away} away />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Bench title={homeName} side={lineups.home} />
        <Bench title={awayName} side={lineups.away} />
      </div>
    </div>
  );
}
