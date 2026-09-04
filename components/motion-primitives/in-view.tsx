'use client';

import * as React from 'react';
import {
  motion,
  useInView,
  type Transition,
  type Variants,
} from 'motion/react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/use-reduced-motion';

export type InViewProps = {
  children: React.ReactNode;
  variants?: { hidden: Variants['hidden']; visible: Variants['visible'] };
  transition?: Transition;
  viewOptions?: {
    root?: React.RefObject<Element | null>;
    margin?: string;
    amount?: 'some' | 'all' | number;
  };
  as?: keyof React.JSX.IntrinsicElements;
  once?: boolean;
  className?: string;
};

/** Derived from the hook itself so the `margin` template-literal type stays in sync. */
type UseInViewOptions = NonNullable<Parameters<typeof useInView>[1]>;

const DEFAULT_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} satisfies Variants;

export function InView({
  children,
  variants = DEFAULT_VARIANTS,
  transition,
  viewOptions,
  as = 'div',
  once = false,
  className,
}: InViewProps): React.JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = React.useMemo(
    () => motion.create(as as 'div') as typeof motion.div,
    [as],
  );

  const isInView = useInView(ref, {
    root: viewOptions?.root,
    margin: viewOptions?.margin as UseInViewOptions['margin'],
    amount: viewOptions?.amount,
    once,
  });

  const state = shouldReduceMotion || isInView ? 'visible' : 'hidden';

  return (
    <MotionTag
      ref={ref}
      initial={shouldReduceMotion ? 'visible' : 'hidden'}
      animate={state}
      variants={variants as Variants}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}
