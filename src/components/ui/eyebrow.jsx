import { cn } from '@/lib/utils';

/** Etiqueta en mayúsculas. tone: 'muted' | 'primary' */
export function Eyebrow({ tone = 'muted', children }) {
  return (
    <div className={cn('text-xs font-semibold uppercase', tone === 'primary' ? 'tracking-wide text-primary' : 'tracking-wider text-faint')}>
      {children}
    </div>
  );
}
