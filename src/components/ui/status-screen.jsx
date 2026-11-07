import { cn } from '@/lib/utils';

/** Pantalla de estado (404, error, vacío): icono + título + texto + acciones. */
export function StatusScreen({ icon: Icon, tone = 'muted', code, title, text, children }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-12 text-center animate-in fade-in-0 zoom-in-95 duration-500 motion-reduce:animate-none">
      <span className={cn('grid size-20 place-items-center rounded-full', tone === 'danger' ? 'bg-live/15 text-live' : 'bg-secondary text-primary')}>
        <Icon animate loop loopDelay={1800} className="size-9" aria-hidden />
      </span>
      {code && <span className="font-mono text-sm text-faint">{code}</span>}
      <div className="flex flex-col gap-2">
        <h1 className="text-score leading-none font-black tracking-tight">{title}</h1>
        {text && <p className="max-w-sm text-muted-foreground">{text}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">{children}</div>
    </div>
  );
}
