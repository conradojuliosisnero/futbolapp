'use client';

import { useState } from 'react';
import { SplitBar } from '@/components/ui/split-bar';
import { cn } from '@/lib/utils';

export function PredictionBar({ match, title = '¿Quién gana?', onVote }) {
  const { prediction: p, home, away } = match;
  const [vote, setVote] = useState(null);
  const options = [
    { id: 'home', label: `${home.code} ${p.home}%`, value: p.home, tone: 'primary' },
    { id: 'draw', label: `Empate ${p.draw}%`, value: p.draw, tone: 'neutral-2', muted: true },
    { id: 'away', label: `${away.code} ${p.away}%`, value: p.away, tone: 'neutral-1' },
  ];
  const choose = (id) => { setVote(id); onVote?.(id); };

  return (
    <div className="flex flex-col gap-2.5 rounded-3xl bg-card px-5 py-4">
      <div className="flex justify-between text-md font-semibold text-muted-foreground">
        <span>{title}</span>{p.votes && <span>{p.votes} votos</span>}
      </div>
      <SplitBar height={10} segments={options} />
      <div className="flex justify-between text-md font-bold">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => choose(o.id)}
            aria-pressed={vote === o.id}
            className={cn('min-h-8', o.muted && 'text-subtle', vote === o.id && 'text-primary underline underline-offset-4')}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
