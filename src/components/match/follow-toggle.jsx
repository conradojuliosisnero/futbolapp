'use client';

import { AnimateIcon } from '@animate-ui/react/icons';
import { Star } from '@/components/animate-ui/icons/star';
import { Toggle } from '@/components/ui/toggle';

export function FollowToggle({ defaultOn = false, onChange }) {
  return (
    <AnimateIcon animateOnTap animateOnHover asChild>
    <Toggle
      aria-label="Seguir partido"
      defaultPressed={defaultOn}
      onPressedChange={onChange}
      className="group h-12 w-13 rounded-2xl bg-scrim hover:bg-scrim data-[state=on]:bg-scrim data-[state=on]:text-primary"
    >
      <Star className="size-5! transition-[fill] group-data-[state=on]:fill-current" />
    </Toggle>
    </AnimateIcon>
  );
}
