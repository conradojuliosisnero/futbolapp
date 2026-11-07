import { cn } from '@/lib/utils';

/** Imagen o placeholder rayado con etiqueta. */
export function Media({ src, alt = '', label, className, children }) {
  return (
    <div
      className={cn('relative size-full overflow-hidden', className)}
      style={{ background: 'repeating-linear-gradient(135deg, var(--placeholder-a) 0 10px, var(--placeholder-b) 10px 20px)' }}
    >
      {src
        // eslint-disable-next-line @next/next/no-img-element -- imágenes de la API externa, sin optimizar
        ? <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" />
        : label && <span className="absolute top-3 left-3.5 font-mono text-2xs text-faint">{label}</span>}
      {children}
    </div>
  );
}
