'use client';

import { useState } from 'react';
import { SplitBar } from '@/components/ui';
import { cx } from '@/lib/utils/cx';
import styles from './PredictionBar.module.css';

export default function PredictionBar({ match, title = '¿Quién gana?', onVote }) {
  const { prediction: p, home, away } = match;
  const [vote, setVote] = useState(null);
  const options = [
    { id: 'home', label: `${home.code} ${p.home}%`, value: p.home, tone: 'accent' },
    { id: 'draw', label: `Empate ${p.draw}%`, value: p.draw, tone: 'neutral-2', muted: true },
    { id: 'away', label: `${away.code} ${p.away}%`, value: p.away, tone: 'neutral-1' },
  ];
  const choose = (id) => { setVote(id); onVote?.(id); };

  return (
    <div className={styles.card}>
      <div className={styles.head}><span>{title}</span>{p.votes && <span>{p.votes} votos</span>}</div>
      <SplitBar height={10} segments={options} />
      <div className={styles.options}>
        {options.map((o) => (
          <button key={o.id} onClick={() => choose(o.id)} aria-pressed={vote === o.id} className={cx(o.muted && styles.muted, vote === o.id && styles.voted)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
