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

export type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: { bounce?: number };
};

export function Spotlight({
  className,
  size = 200,
  springOptions,
}: SpotlightProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [parent, setParent] = React.useState<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const offsetX = useTransform(mouseX, (value) => value - size / 2);
  const offsetY = useTransform(mouseY, (value) => value - size / 2);
  const x = useSpring(offsetX, { bounce: 0, ...springOptions });
  const y = useSpring(offsetY, { bounce: 0, ...springOptions });

  // The spotlight positions itself against whatever element contains it.
  React.useEffect(() => {
    const parentNode = ref.current?.parentElement ?? null;
    if (!parentNode) return;

    const previousPosition = parentNode.style.position;
    const previousOverflow = parentNode.style.overflow;
    parentNode.style.position = 'relative';
    parentNode.style.overflow = 'hidden';
    setParent(parentNode);

    return () => {
      parentNode.style.position = previousPosition;
      parentNode.style.overflow = previousOverflow;
    };
  }, []);

  React.useEffect(() => {
    if (!parent) return;

    const handleMove = (event: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    };
    const handleEnter = () => setIsHovered(true);
    const handleLeave = () => setIsHovered(false);

    parent.addEventListener('mousemove', handleMove);
    parent.addEventListener('mouseenter', handleEnter);
    parent.addEventListener('mouseleave', handleLeave);

    return () => {
      parent.removeEventListener('mousemove', handleMove);
      parent.removeEventListener('mouseenter', handleEnter);
      parent.removeEventListener('mouseleave', handleLeave);
    };
  }, [mouseX, mouseY, parent]);

  if (shouldReduceMotion) return <></>;

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute rounded-full blur-xl transition-opacity duration-200',
        isHovered ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{ width: size, height: size, left: 0, top: 0, x, y }}
    />
  );
}
