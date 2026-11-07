'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimateIcon } from '@animate-ui/react/icons';
import { Search } from '@/components/animate-ui/icons/search';
import { LoaderCircle } from '@/components/animate-ui/icons/loader-circle';
import { TeamCrest } from '@/components/ui/team-crest';
import { cn, ENTER, stagger } from '@/lib/utils';

/**
 * Buscador de equipos y ligas.
 * variant 'dropdown': resultados flotando bajo la caja (escritorio). 'page': resultados debajo, a pantalla completa (/buscar).
 */
export function SearchBox({ variant = 'dropdown', autoFocus = false, className }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [res, setRes] = useState({ leagues: [], teams: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef(null);

  // Busca 250 ms después de dejar de escribir; cancela la búsqueda anterior si llega una nueva.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/buscar?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        setRes(await r.json()); setActive(0);
      } catch { /* cancelada o sin conexión */ }
      finally { setLoading(false); }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  // Cierra el desplegable al tocar fuera.
  useEffect(() => {
    const close = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const short = q.trim().length < 2;
  const items = short ? [] : [
    ...res.leagues.map((l) => ({ key: `l-${l.code}`, href: `/ligas/${l.code}`, title: l.name, sub: `Liga · ${l.country}`, crest: l.emblem })),
    ...res.teams.map((t) => ({ key: `t-${t.id}`, href: `/equipo/${t.id}`, title: t.name, sub: t.league, crest: t.crest })),
  ];
  const go = (href) => { setOpen(false); setQ(''); router.push(href); };

  function onKeyDown(e) {
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + items.length) % items.length); }
    if (e.key === 'Enter') { e.preventDefault(); go(items[active].href); }
    if (e.key === 'Escape') setOpen(false);
  }

  const showList = variant === 'page' || open;
  const list = !short && (
    <div
      id="search-results"
      role="listbox"
      className={cn(
        'flex flex-col overflow-hidden',
        variant === 'dropdown' ? 'absolute inset-x-0 top-[calc(100%+8px)] z-40 max-h-[60vh] overflow-y-auto rounded-2xl bg-popover shadow-2xl ring-1 ring-border animate-in fade-in-0 slide-in-from-top-1 duration-200' : 'rounded-2xl bg-card',
      )}
    >
      {items.length === 0
        ? <p className="px-4 py-5 text-sm text-muted-foreground">{loading ? 'Buscando…' : `Sin resultados para “${q.trim()}”.`}</p>
        : items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(it.href)}
            style={stagger(i)}
            className={cn(ENTER, 'flex items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 transition-colors', i === active ? 'bg-secondary' : 'hover:bg-secondary')}
          >
            <TeamCrest team={{ name: it.title, crest: it.crest }} size={28} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{it.title}</span>
              <span className="truncate text-xs text-muted-foreground">{it.sub}</span>
            </span>
          </button>
        ))}
    </div>
  );

  return (
    <div ref={box} className={cn('relative', className)}>
      <AnimateIcon animateOnHover asChild>
        <label className="flex h-11 items-center gap-2.5 rounded-full bg-card px-4.5 text-faint ring-primary/40 transition-shadow focus-within:ring-2">
          {loading ? <LoaderCircle animate loop className="size-4" aria-hidden /> : <Search className="size-4" aria-hidden />}
          <input
            type="search"
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Buscar equipos y ligas"
            role="combobox"
            aria-label="Buscar equipos y ligas"
            aria-controls="search-results"
            aria-expanded={showList && !short}
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-faint"
          />
        </label>
      </AnimateIcon>
      {showList && list}
    </div>
  );
}
