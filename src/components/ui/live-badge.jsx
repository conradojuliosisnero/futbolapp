import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function LiveBadge({ children = 'EN VIVO', pulse = true }) {
  return (
    <Badge variant="live">
      <span className={cn('size-1.5 rounded-full bg-current', pulse && 'animate-pulse-live')} aria-hidden />
      {children}
    </Badge>
  );
}
