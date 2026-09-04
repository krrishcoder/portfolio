'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';

export type TextShimmerProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
  /** Resting colour of the glyphs. Must be a real colour, not `currentColor`. */
  baseColor?: string;
  /** Colour of the travelling highlight. */
  shimmerColor?: string;
};

const GRADIENT =
  'linear-gradient(90deg, #0000 calc(50% - var(--spread)), var(--base-gradient-color), #0000 calc(50% + var(--spread)))';

export function TextShimmer({
  children,
  as = 'p',
  className,
  duration = 2,
  spread = 2,
  baseColor = 'var(--color-dim)',
  shimmerColor = 'var(--color-ink)',
}: TextShimmerProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = React.useMemo(
    () => motion.create(as as 'span') as typeof motion.span,
    [as],
  );
  const dynamicSpread = React.useMemo(
    () => Math.max(children.length * spread, 1),
    [children, spread],
  );

  // The two colours are props rather than arbitrary-property classes for a
  // reason: the glyphs are painted by `background-clip: text` over
  // `color: transparent`, so if --base-color ever resolves to `currentColor` the
  // text is invisible outside the highlight. Passing them through `style` also
  // means a caller cannot lose the override to class ordering.
  const style = {
    '--spread': `${dynamicSpread}px`,
    '--base-color': baseColor,
    '--base-gradient-color': shimmerColor,
    backgroundImage: `${GRADIENT}, linear-gradient(var(--base-color), var(--base-color))`,
  } as React.CSSProperties;

  return (
    <MotionComponent
      className={cn(
        'shimmer relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent [background-clip:text]',
        className,
      )}
      initial={{ backgroundPosition: '100% center' }}
      animate={
        shouldReduceMotion
          ? { backgroundPosition: '50% center' }
          : { backgroundPosition: '0% center' }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { repeat: Infinity, duration, ease: 'linear' }
      }
      style={style}
    >
      {children}
    </MotionComponent>
  );
}
