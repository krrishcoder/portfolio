'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';

export type PresetTypeGroup =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'blur'
  | 'blur-slide'
  | 'zoom'
  | 'flip'
  | 'bounce'
  | 'rotate'
  | 'swing';

export type AnimatedGroupProps = {
  children: React.ReactNode;
  className?: string;
  variants?: { container?: Variants; item?: Variants };
  preset?: PresetTypeGroup;
  as?: keyof React.JSX.IntrinsicElements;
  asChild?: keyof React.JSX.IntrinsicElements;
};

const DEFAULT_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const REDUCED_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0 } },
};

const PRESETS: Record<PresetTypeGroup, Variants> = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slide: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } },
  blur: {
    hidden: { opacity: 0, filter: 'blur(4px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
  'blur-slide': {
    hidden: { opacity: 0, filter: 'blur(4px)', y: 20 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  },
  flip: {
    hidden: { opacity: 0, rotateX: -90 },
    visible: {
      opacity: 1,
      rotateX: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  },
  bounce: {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
  },
  rotate: {
    hidden: { opacity: 0, rotate: -180 },
    visible: {
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  },
  swing: {
    hidden: { opacity: 0, rotate: -10 },
    visible: {
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 300, damping: 8 },
    },
  },
};

export function AnimatedGroup({
  children,
  className,
  variants,
  preset,
  as = 'div',
  asChild = 'div',
}: AnimatedGroupProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const MotionContainer = React.useMemo(
    () => motion.create(as as 'div') as typeof motion.div,
    [as],
  );
  const MotionItem = React.useMemo(
    () => motion.create(asChild as 'div') as typeof motion.div,
    [asChild],
  );

  const containerVariants =
    variants?.container ??
    (shouldReduceMotion ? REDUCED_CONTAINER : DEFAULT_CONTAINER);
  const itemVariants =
    variants?.item ?? PRESETS[shouldReduceMotion ? 'fade' : (preset ?? 'fade')];

  return (
    <MotionContainer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(className)}
    >
      {React.Children.toArray(children).map((child, index) => (
        <MotionItem
          key={React.isValidElement(child) && child.key ? child.key : index}
          variants={itemVariants}
        >
          {child}
        </MotionItem>
      ))}
    </MotionContainer>
  );
}
