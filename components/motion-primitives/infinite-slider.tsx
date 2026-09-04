'use client';

import * as React from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const translate = useMotionValue(0);
  const [size, setSize] = React.useState(0);
  const [currentSpeed, setCurrentSpeed] = React.useState(speed);
  const [cycle, setCycle] = React.useState(0);
  const isHorizontal = direction === 'horizontal';

  React.useEffect(() => {
    setCurrentSpeed(speed);
  }, [speed]);

  // Measure one copy of the content; the loop distance is that size plus the gap.
  React.useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      setSize(isHorizontal ? rect.width : rect.height);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isHorizontal]);

  React.useEffect(() => {
    if (shouldReduceMotion || size <= 0) return;

    const distance = size + gap;
    const from = reverse ? -distance : 0;
    const to = reverse ? 0 : -distance;
    const current = translate.get();
    // Restart from the current offset so speed changes never jump.
    const start = Math.abs(to - current) < 1 ? from : current;
    if (start !== current) translate.set(start);

    const controls = animate(translate, [start, to], {
      ease: 'linear',
      duration: Math.abs(to - start) / Math.max(currentSpeed, 1),
      onComplete: () => {
        translate.set(from);
        setCycle((value) => value + 1);
      },
    });

    return () => {
      controls.stop();
    };
  }, [cycle, currentSpeed, gap, reverse, shouldReduceMotion, size, translate]);

  const handleEnter = () => {
    if (speedOnHover !== undefined) setCurrentSpeed(speedOnHover);
  };
  const handleLeave = () => {
    if (speedOnHover !== undefined) setCurrentSpeed(speed);
  };

  const track = isHorizontal ? 'flex-row' : 'flex-col';

  return (
    <div
      className={cn('overflow-hidden', className)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <motion.div
        className={cn('flex', track, isHorizontal ? 'w-max' : 'h-max')}
        style={{
          gap,
          ...(isHorizontal ? { x: translate } : { y: translate }),
        }}
      >
        <div ref={contentRef} className={cn('flex', track)} style={{ gap }}>
          {children}
        </div>
        <div aria-hidden="true" className={cn('flex', track)} style={{ gap }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
