'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';

export type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

const BASE_TRANSITION: Transition = {
  repeat: Infinity,
  duration: 5,
  ease: 'linear',
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  delay,
  onAnimationComplete,
  style,
}: BorderTrailProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return <></>;

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn('absolute aspect-square bg-current', className)}
        style={{
          width: size,
          height: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{
          ...(transition ?? BASE_TRANSITION),
          ...(delay !== undefined && { delay }),
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
