'use client';

import * as React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { cn } from '@/lib/cn';

export type ScrollProgressProps = {
  className?: string;
  springOptions?: { stiffness?: number; damping?: number; restDelta?: number };
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

const DEFAULT_SPRING = { stiffness: 200, damping: 50, restDelta: 0.001 };

export function ScrollProgress({
  className,
  springOptions,
  containerRef,
}: ScrollProgressProps): React.JSX.Element {
  // No `layoutEffect: false` here. It is not in this version's ScrollOptions, and
  // the default is the better behaviour anyway: measuring before paint means the
  // bar is correct on first frame instead of one frame late. Motion already falls
  // back to useEffect on the server, so the default costs no hydration warning.
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    ...DEFAULT_SPRING,
    ...springOptions,
  });

  // No positioning or thickness in the base class. `cn` is a plain join, not a
  // conflict-resolving merge, so shipping `top-0 h-1` here would silently beat a
  // caller's `bottom-0 h-px`: with `top` and a height both set, CSS ignores
  // `bottom`. Callers own placement; this only owns the transform origin.
  return (
    <motion.div
      className={cn('origin-left', className)}
      style={{ scaleX }}
    />
  );
}
