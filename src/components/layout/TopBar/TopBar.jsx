'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HOME_FILTERS } from '@/config/navigation';
import { Logo, Chip, IconButton } from '@/components/ui';
import styles from './TopBar.module.css';

export default function TopBar({ liveCount, defaultFilter = 'live', onFilterChange, onSearch }) {
  const [filter, setFilter] = useState(defaultFilter);
  const select = (id) => { setFilter(id); onFilterChange?.(id); };

  return (
    <header className={styles.top}>
      <div className={styles.row}>
        <div className={styles.logo}><Logo /></div>
        <label className={styles.search}>
          <span aria-hidden>⌕</span>
          <input type="search" placeholder="Buscar equipos, ligas, jugadores" onChange={(e) => onSearch?.(e.target.value)} />
        </label>
        <div className={styles.actions}>
          <IconButton label="Buscar">⌕</IconButton>
          <Link href="/entrar" className={styles.avatar} aria-label="Perfil" />
        </div>
      </div>
      <div className={styles.chips}>
        {HOME_FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} count={f.id === 'live' ? liveCount : undefined} onClick={() => select(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>
    </header>
  );
}
