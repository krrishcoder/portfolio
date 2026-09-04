'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/use-reduced-motion';

export type TiltProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  rotationFactor?: number;
  isReverse?: boolean;
  springOptions?: { stiffness?: number; damping?: number; mass?: number };
};

const DEFAULT_SPRING = { stiffness: 260, damping: 20, mass: 0.4 };

export function Tilt({
  children,
  className,
  style,
  rotationFactor = 15,
  isReverse = false,
  springOptions,
}: TiltProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { ...DEFAULT_SPRING, ...springOptions });
  const springY = useSpring(pointerY, { ...DEFAULT_SPRING, ...springOptions });

  const factor = isReverse ? -rotationFactor : rotationFactor;
  const rotateX = useTransform(springY, [-0.5, 0.5], [factor, -factor]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-factor, factor]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  if (shouldReduceMotion) {
    return (
      <div className={cn(className)} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={{
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
        ...style,
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
