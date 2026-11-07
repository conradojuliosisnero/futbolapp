import { cn } from '@/lib/utils';

/** Foto redonda del jugador con dorsal; sin foto muestra el dorsal o la inicial. */
export function PlayerAvatar({ player, size = 40, className, ring }) {
  const label = player.number ?? (player.name ?? '?')[0];
  return (
    <span className={cn('relative inline-grid flex-none place-items-center', className)} style={{ width: size, height: size }}>
      {player.photo
        // eslint-disable-next-line @next/next/no-img-element -- foto del CDN de API-Football (la guarda el service worker)
        ? <img src={player.photo} alt="" loading="lazy" className={cn('size-full rounded-full bg-secondary object-cover', ring)} />
        : <span className={cn('grid size-full place-items-center rounded-full bg-secondary text-sm font-black text-subtle', ring)}>{label}</span>}
      {player.photo && player.number != null && (
        <span className="absolute -right-1 -bottom-1 grid min-w-5 place-items-center rounded-full bg-background px-1 text-2xs font-black tabular-nums ring-1 ring-border">
          {player.number}
        </span>
      )}
    </span>
  );
}
