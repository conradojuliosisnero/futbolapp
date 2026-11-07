'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { HOME_FILTERS } from '@/config/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function TopBar({ liveCount, defaultFilter = 'live', onFilterChange, onSearch }) {
  const [filter, setFilter] = useState(defaultFilter);
  // Radix devuelve '' al desmarcar el activo: mantenemos siempre uno seleccionado.
  const select = (id) => { if (!id) return; setFilter(id); onFilterChange?.(id); };

  return (
    <header className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center justify-between gap-4 md:max-w-[460px] md:flex-1">
        <div className="md:hidden"><Logo /></div>
        <label className="hidden h-11 flex-1 items-center gap-2.5 rounded-full bg-card px-4.5 text-faint md:flex">
          <Search className="size-4" aria-hidden />
          <input
            type="search"
            placeholder="Buscar equipos, ligas, jugadores"
            onChange={(e) => onSearch?.(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-faint"
          />
        </label>
        <div className="flex items-center gap-2.5 md:hidden">
          <Button variant="secondary" size="icon-touch" aria-label="Buscar"><Search /></Button>
          <Link href="/entrar" aria-label="Perfil" className="size-11 rounded-full bg-accent" />
        </div>
      </div>

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
