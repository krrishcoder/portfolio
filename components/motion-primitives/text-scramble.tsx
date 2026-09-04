'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';

export type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characters?: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  trigger?: boolean;
  onScrambleComplete?: () => void;
};

const DEFAULT_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characters = DEFAULT_CHARACTERS,
  className,
  as = 'p',
  trigger = true,
  onScrambleComplete,
}: TextScrambleProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = React.useMemo(
    () => motion.create(as as 'p') as typeof motion.p,
    [as],
  );
  const [displayText, setDisplayText] = React.useState(children);

  const onCompleteRef = React.useRef(onScrambleComplete);
  React.useEffect(() => {
    onCompleteRef.current = onScrambleComplete;
  }, [onScrambleComplete]);

  React.useEffect(() => {
    if (!trigger || shouldReduceMotion || children.length === 0) {
      setDisplayText(children);
      return;
    }

    const pool = characters.length > 0 ? characters : DEFAULT_CHARACTERS;
    const stepSeconds = Math.max(speed, 0.01);
    const totalSteps = Math.max(Math.ceil(duration / stepSeconds), 1);
    const source = Array.from(children);
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      const progress = Math.min(step / totalSteps, 1);
      const lockedCount = Math.floor(source.length * progress);

      setDisplayText(
        source
          .map((char, index) => {
            if (/\s/.test(char)) return char;
            if (index < lockedCount) return char;
            return pool[Math.floor(Math.random() * pool.length)];
          })
          .join(''),
      );

      if (progress >= 1) {
        clearInterval(timer);
        setDisplayText(children);
        onCompleteRef.current?.();
      }
    }, stepSeconds * 1000);

    return () => {
      clearInterval(timer);
    };
  }, [characters, children, duration, shouldReduceMotion, speed, trigger]);

  return (
    <MotionTag className={cn(className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">{displayText}</span>
    </MotionTag>
  );
}
