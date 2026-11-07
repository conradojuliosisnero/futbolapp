/** size: 'sm' (24) | 'md' (40) | 'lg' (52) */
const SIZES = { sm: 24, md: 40, lg: 52 };

export function TeamCrest({ team, size = 'md' }) {
  const px = SIZES[size] ?? size;
  const style = { width: px, height: px };
  const cls = 'inline-block flex-none rounded-full bg-neutral-1 object-cover';
  // eslint-disable-next-line @next/next/no-img-element -- escudos de la API externa, sin optimizar
  if (team?.crest) return <img src={team.crest} alt={team.name} className={cls} style={style} />;
  return <span className={cls} style={style} aria-hidden />;
}
