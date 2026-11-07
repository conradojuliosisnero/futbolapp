'use client';

import { useState } from 'react';
import { SearchBox } from '@/components/search/search-box';
import { HOME_FILTERS } from '@/config/navigation';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function TopBar({ liveCount, defaultFilter = 'live', onFilterChange }) {
  const [filter, setFilter] = useState(defaultFilter);
  // Radix devuelve '' al desmarcar el activo: mantenemos siempre uno seleccionado.
  const select = (id) => { if (!id) return; setFilter(id); onFilterChange?.(id); };

  return (
    <header className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
      <SearchBox className="hidden max-w-115 flex-1 md:block" />

      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={select}
        aria-label="Filtrar partidos"
        className="no-scrollbar w-full overflow-x-auto md:w-fit"
      >
        {HOME_FILTERS.map((f) => (
          <ToggleGroupItem
            key={f.id}
            value={f.id}
            className="h-9 rounded-full bg-secondary px-3.5 text-md font-semibold text-control hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {f.label}{f.id === 'live' && liveCount != null && <span> · {liveCount}</span>}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </header>
  );
}
