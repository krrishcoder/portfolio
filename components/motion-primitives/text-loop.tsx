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

export type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  trigger?: boolean;
  mode?: 'popLayout' | 'wait' | 'sync';
};

const DEFAULT_TRANSITION: Transition = { duration: 0.35, ease: 'easeInOut' };

const MOTION_VARIANTS: Variants = {
  initial: { y: 20, opacity: 0, filter: 'blur(4px)' },
  animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
  exit: { y: -20, opacity: 0, filter: 'blur(4px)' },
};

const FADE_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function TextLoop({
  children,
  className,
  interval = 2.5,
  transition = DEFAULT_TRANSITION,
  variants,
  onIndexChange,
  trigger = true,
  mode = 'popLayout',
}: TextLoopProps): React.JSX.Element {
  const [index, setIndex] = React.useState(0);
  const shouldReduceMotion = useReducedMotion();
  const items = React.useMemo(
    () => React.Children.toArray(children),
    [children],
  );
  const itemCount = items.length;

  // Keep the callback in a ref so a new inline function each render does not
  // restart the interval.
  const onIndexChangeRef = React.useRef(onIndexChange);
  React.useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  }, [onIndexChange]);

  // Reduced motion stops the rotation outright rather than merely shortening
  // the crossfade: an indefinite 2.5s content swap with no pause control is the
  // exact thing WCAG 2.2.2 asks you not to do, and softening the transition
  // would not change that. The first child stays on screen instead.
  React.useEffect(() => {
    if (!trigger || itemCount <= 1 || shouldReduceMotion) return;

    const intervalMs = Math.max(interval, 0.05) * 1000;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % itemCount);
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [interval, itemCount, shouldReduceMotion, trigger]);

  // If the preference flips on after mount, go back to the first entry so the
  // reader is not left on whichever one happened to be showing.
  React.useEffect(() => {
    if (shouldReduceMotion) setIndex(0);
  }, [shouldReduceMotion]);

  // Reset when the number of children shrinks below the active index.
  React.useEffect(() => {
    if (itemCount > 0 && index > itemCount - 1) {
      setIndex(0);
    }
  }, [index, itemCount]);

  const isFirstIndexEffect = React.useRef(true);
  React.useEffect(() => {
    if (isFirstIndexEffect.current) {
      isFirstIndexEffect.current = false;
      return;
    }
    onIndexChangeRef.current?.(index);
  }, [index]);

  const activeVariants =
    variants ?? (shouldReduceMotion ? FADE_VARIANTS : MOTION_VARIANTS);
  const activeTransition: Transition = shouldReduceMotion
    ? { duration: 0.15 }
    : transition;
  const safeIndex = itemCount > 0 ? index % itemCount : 0;

  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <AnimatePresence mode={mode} initial={false}>
        <motion.div
          key={safeIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={activeTransition}
          variants={activeVariants}
        >
          {items[safeIndex] ?? null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
