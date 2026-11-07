import { ago } from '@/lib/api/dates';
import { cn, ENTER, stagger } from '@/lib/utils';

/** Tarjeta de noticia: abre la nota completa en ESPN (sitio externo). */
function NewsCard({ item, index, featured }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={stagger(index)}
      className={cn(ENTER, 'group flex flex-col overflow-hidden rounded-3xl bg-card transition-[background-color,transform] hover:bg-secondary hover:text-inherit active:scale-[0.99]', featured && 'md:col-span-2')}
    >
      {item.image && (
        <div className={cn('relative overflow-hidden bg-secondary', featured ? 'aspect-[16/8]' : 'aspect-video')}>
          {/* eslint-disable-next-line @next/next/no-img-element -- imagen de ESPN (externa) */}
          <img src={item.image} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold text-primary">{item.league}</span>
        <h3 className={cn('font-extrabold leading-snug', featured ? 'text-lg' : 'text-[15px]')}>{item.headline}</h3>
        {item.description && <p className="line-clamp-2 text-md text-muted-foreground">{item.description}</p>}
        <span className="mt-auto pt-1 text-xs text-faint">{item.published ? ago(item.published) : ''} · ESPN</span>
      </div>
    </a>
  );
}

export function NewsList({ items, featuredFirst = true, empty = 'No hay noticias por ahora.' }) {
  if (!items.length) return <p className="py-6 text-center text-muted-foreground">{empty}</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((n, i) => <NewsCard key={n.id} item={n} index={i} featured={featuredFirst && i === 0} />)}
    </div>
  );
}
