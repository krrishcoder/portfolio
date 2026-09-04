'use client';

import * as React from 'react';
import { motion, useSpring } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';

export type MagneticProps = {
  children: React.ReactNode;
  intensity?: number;
  range?: number;
  actionArea?: 'self' | 'parent' | 'global';
  springOptions?: { stiffness?: number; damping?: number; mass?: number };
  className?: string;
};

const DEFAULT_SPRING = { stiffness: 200, damping: 18, mass: 0.4 };

export function Magnetic({
  children,
  intensity = 0.6,
  range = 100,
  actionArea = 'self',
  springOptions,
  className,
}: MagneticProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = React.useState(actionArea === 'global');
  const x = useSpring(0, { ...DEFAULT_SPRING, ...springOptions });
  const y = useSpring(0, { ...DEFAULT_SPRING, ...springOptions });

  // Activation source: parent element listeners, or permanently on for 'global'.
  React.useEffect(() => {
    if (actionArea === 'global') {
      setIsActive(true);
      return;
    }

    setIsActive(false);
    if (actionArea !== 'parent') return;

    const parent = ref.current?.parentElement;
    if (!parent) return;

    const handleEnter = () => setIsActive(true);
    const handleLeave = () => setIsActive(false);
    parent.addEventListener('mouseenter', handleEnter);
    parent.addEventListener('mouseleave', handleLeave);

    return () => {
      parent.removeEventListener('mouseenter', handleEnter);
      parent.removeEventListener('mouseleave', handleLeave);
    };
  }, [actionArea]);

  // Pointer proximity → translation.
  React.useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMove = (event: MouseEvent) => {
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const deltaX = event.clientX - (rect.left + rect.width / 2);
      const deltaY = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (isActive && range > 0 && distance <= range) {
        const falloff = 1 - distance / range;
        x.set(deltaX * intensity * falloff);
        y.set(deltaY * intensity * falloff);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
    };
  }, [intensity, isActive, range, shouldReduceMotion, x, y]);

  // Snap back whenever the magnet deactivates.
  React.useEffect(() => {
    if (isActive) return;
    x.set(0);
    y.set(0);
  }, [isActive, x, y]);

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseEnter={actionArea === 'self' ? () => setIsActive(true) : undefined}
      onMouseLeave={actionArea === 'self' ? () => setIsActive(false) : undefined}
    >
      {children}
    </motion.div>
  );
}
