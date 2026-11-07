'use client';

import Link from 'next/link';
import { AnimateIcon } from '@animate-ui/react/icons';
import { cn } from '@/lib/utils';

/**
 * Link cuyos iconos animados (Animate UI) se animan al pasar el cursor o tocar, con leve "press".
 * animate: true para animar el icono al montar (ej. ítem activo del menú).
 */
export function AnimatedLink({ animate, className, ...props }) {
  return (
    <AnimateIcon animateOnHover animateOnTap animate={animate} asChild>
      <Link className={cn('transition-transform active:scale-[0.98] motion-reduce:active:scale-100', className)} {...props} />
    </AnimateIcon>
  );
}
