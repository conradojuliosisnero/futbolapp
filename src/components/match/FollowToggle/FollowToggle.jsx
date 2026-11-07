'use client';

import { useState } from 'react';
import { IconButton } from '@/components/ui';

export default function FollowToggle({ defaultOn = false, onChange }) {
  const [on, setOn] = useState(defaultOn);
  const toggle = () => { setOn(!on); onChange?.(!on); };
  return (
    <IconButton label="Seguir partido" shape="rounded" tone="scrim" active={on} aria-pressed={on} onClick={toggle}>
      {on ? '★' : '☆'}
    </IconButton>
  );
}
