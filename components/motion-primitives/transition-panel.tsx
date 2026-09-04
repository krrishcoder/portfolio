'use client';

import * as React from 'react';
import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from 'motion/react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/use-reduced-motion';

export type TransitionPanelProps = {
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
  activeIndex: number;
  variants?: {
    enter: Record<string, unknown>;
    center: Record<string, unknown>;
    exit: Record<string, unknown>;
  };
  custom?: number;
};

const DEFAULT_VARIANTS: Variants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const FADE_VARIANTS: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export function TransitionPanel({
  children,
  className,
  transition,
  activeIndex,
  variants,
  custom,
}: TransitionPanelProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const items = React.Children.toArray(children);
  const index = Math.min(Math.max(activeIndex, 0), Math.max(items.length - 1, 0));

  // Loosely typed by design: callers may pass variant resolvers keyed off `custom`.
  const activeVariants = (variants ??
    (shouldReduceMotion ? FADE_VARIANTS : DEFAULT_VARIANTS)) as unknown as Variants;

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence initial={false} mode="popLayout" custom={custom}>
        <motion.div
          key={activeIndex}
          variants={activeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          custom={custom}
          transition={shouldReduceMotion ? { duration: 0 } : transition}
        >
          {items[index] ?? null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
