import Link from 'next/link';
import { Play } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Media } from '@/components/ui/media';

function HighlightCard({ item }) {
  return (
    <Link href={item.href ?? '#'} className="flex snap-start flex-col gap-2.5">
      <div className="relative h-33">
        <Media src={item.thumb} label="miniatura video" className="rounded-2xl" />
        <span className="absolute inset-0 grid place-items-center" aria-hidden>
          <span className="grid size-11 place-items-center rounded-full bg-shade backdrop-blur-sm"><Play className="size-4 fill-current" /></span>
        </span>
        <span className="absolute right-2.5 bottom-2.5 rounded-md bg-shade px-1.5 py-0.5 text-xs font-semibold">{item.duration}</span>
      </div>
      <span className="text-[15px] font-bold">{item.title}</span>
    </Link>
  );
}

export function HighlightsGrid({ title, items, action = { href: '#', label: 'Ver todo' } }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title={title} action={action} />
      <div className="no-scrollbar grid snap-x snap-mandatory auto-cols-[72%] grid-flow-col gap-3.5 overflow-x-auto md:grid-flow-row md:grid-cols-3 md:overflow-visible">
        {items.map((h) => <HighlightCard key={h.id} item={h} />)}
      </div>
    </section>
  );
}
