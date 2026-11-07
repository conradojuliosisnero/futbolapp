'use client';

import { useRouter } from 'next/navigation';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

/** Chips para filtrar noticias por liga (cambia ?liga= en la URL). */
export function LeagueFilter({ leagues, value }) {
  const router = useRouter();
  return (
    <ToggleGroup
      type="single"
      value={value ?? 'all'}
      onValueChange={(v) => { if (v) router.push(v === 'all' ? '/noticias' : `/noticias?liga=${encodeURIComponent(v)}`, { scroll: false }); }}
      aria-label="Filtrar noticias por liga"
      className="no-scrollbar w-full overflow-x-auto"
    >
      {[{ code: 'all', name: 'Todas' }, ...leagues].map((l) => (
        <ToggleGroupItem
          key={l.code}
          value={l.code}
          className="h-9 flex-none rounded-full bg-secondary px-3.5 text-md font-semibold text-control hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {l.name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
