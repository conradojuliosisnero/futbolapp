import Link from 'next/link';
import { PlayerAvatar } from '@/components/ui/player-avatar';
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
  const body = (
    <>
      <PlayerAvatar player={p} size={32} ring={cn('ring-2 shadow-md', away ? 'ring-white' : 'ring-primary')} />
      <span className="line-clamp-1 max-w-full text-2xs font-bold text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]">{shortName(p.name)}</span>
    </>
  );
  const cls = 'flex w-14 min-w-0 flex-col items-center gap-1 text-center sm:w-16';
  return p.id
    ? <Link href={`/jugador/${p.id}`} className={cn(cls, 'transition-transform hover:scale-105 hover:text-inherit')}>{body}</Link>
    : <span className={cls}>{body}</span>;
}

function Half({ side, away }) {
  // Local de arriba hacia el centro (arquero arriba); visitante al revés (arquero abajo).
  const rows = rowsOf(side.startXI);
  const ordered = away ? [...rows].reverse() : rows;
  return (
    <div className="relative flex flex-1 flex-col justify-around gap-4 py-4">
      {ordered.map((row, i) => (
        <div key={i} className={cn('flex justify-around gap-1 px-1', away && 'flex-row-reverse')}>
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
      {/* Alto según el contenido: con 22 jugadores (8–10 filas) la cancha crece y nadie queda cortado. */}
      <div
        className="relative flex min-h-[560px] flex-col overflow-hidden rounded-3xl ring-1 ring-black/40"
        style={{
          // Césped: franjas en dos verdes (de corte de pasto) y un viñeteado suave en los bordes.
          backgroundColor: '#2e7d32',
          backgroundImage: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.28) 100%), repeating-linear-gradient(0deg, #2e7d32 0 7%, #2a7330 7% 14%)',
        }}
      >
        {/* líneas de la cancha */}
        <span className="pointer-events-none absolute inset-2 rounded-2xl border-2 border-white/45" aria-hidden />
        <span className="pointer-events-none absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-white/45" aria-hidden />
        <span className="pointer-events-none absolute top-1/2 left-1/2 size-24 -translate-1/2 rounded-full border-2 border-white/45" aria-hidden />
        <span className="pointer-events-none absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-white/70" aria-hidden />
        <span className="pointer-events-none absolute top-2 left-1/2 h-[11%] w-[46%] -translate-x-1/2 border-2 border-t-0 border-white/45" aria-hidden />
        <span className="pointer-events-none absolute top-2 left-1/2 h-[4.5%] w-[22%] -translate-x-1/2 border-2 border-t-0 border-white/45" aria-hidden />
        <span className="pointer-events-none absolute bottom-2 left-1/2 h-[11%] w-[46%] -translate-x-1/2 border-2 border-b-0 border-white/45" aria-hidden />
        <span className="pointer-events-none absolute bottom-2 left-1/2 h-[4.5%] w-[22%] -translate-x-1/2 border-2 border-b-0 border-white/45" aria-hidden />
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
