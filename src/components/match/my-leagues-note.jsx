import Link from 'next/link';

/** "Mostrando tus N ligas · Cambiar" sobre las listas filtradas. */
export function MyLeaguesNote({ followed }) {
  if (!followed) return null;
  return (
    <p className="text-xs text-muted-foreground">
      Solo tus {followed.size} {followed.size === 1 ? 'liga' : 'ligas'} · <Link href="/ligas" className="font-semibold text-primary">Cambiar</Link>
    </p>
  );
}
