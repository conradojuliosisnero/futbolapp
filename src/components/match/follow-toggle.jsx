'use client';

import { Star } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

export function FollowToggle({ defaultOn = false, onChange }) {
  return (
    <Toggle
      aria-label="Seguir partido"
      defaultPressed={defaultOn}
      onPressedChange={onChange}
      className="group h-12 w-13 rounded-2xl bg-scrim hover:bg-scrim data-[state=on]:bg-scrim data-[state=on]:text-primary"
    >
      <Star className="size-5! group-data-[state=on]:fill-current" />
    </Toggle>
  );
}
