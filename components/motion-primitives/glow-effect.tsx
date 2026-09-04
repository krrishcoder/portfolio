'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';

type GlowMode =
  | 'rotate'
  | 'pulse'
  | 'breathe'
  | 'colorShift'
  | 'flowHorizontal'
  | 'static';

type GlowBlur =
  | number
  | 'softest'
  | 'soft'
  | 'medium'
  | 'strong'
  | 'stronger'
  | 'strongest'
  | 'none';

export type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?: GlowMode;
  blur?: GlowBlur;
  transition?: Transition;
  scale?: number;
  duration?: number;
};

type GlowAnimation = {
  background: string | string[];
  scale?: number[];
  opacity?: number[];
  transition?: Transition;
};

const BLUR_PX: Record<Exclude<GlowBlur, number>, number> = {
  softest: 2,
  soft: 4,
  medium: 8,
  strong: 16,
  stronger: 24,
  strongest: 40,
  none: 0,
};

const DEFAULT_COLORS = ['#7c8cff', '#ffb547', '#3fdca0', '#a78bfa'];

const radial = (color: string): string =>
  `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`;

export function GlowEffect({
  className,
  style,
  colors = DEFAULT_COLORS,
  mode = 'rotate',
  blur = 'medium',
  transition,
  scale = 1,
  duration = 5,
}: GlowEffectProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const palette = colors.length > 0 ? colors : DEFAULT_COLORS;
  const joined = palette.join(', ');
  const staticBackground = `linear-gradient(to right, ${joined})`;

  const base: Transition = { repeat: Infinity, duration, ease: 'linear' };
  const mirrored: Transition = { ...base, repeatType: 'mirror' };
  const loop = transition ?? base;
  const bounce = transition ?? mirrored;

  const animations: Record<GlowMode, GlowAnimation> = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${joined})`,
        `conic-gradient(from 360deg at 50% 50%, ${joined})`,
      ],
      transition: loop,
    },
    pulse: {
      background: palette.map(radial),
      scale: [scale, scale * 1.1, scale],
      opacity: [0.5, 0.8, 0.5],
      transition: bounce,
    },
    breathe: {
      background: palette.map(radial),
      scale: [scale, scale * 1.05, scale],
      transition: bounce,
    },
    colorShift: {
      background: palette.map((color, index) => {
        const next = palette[(index + 1) % palette.length];
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${next} 50%, ${color} 100%)`;
      }),
      transition: bounce,
    },
    flowHorizontal: {
      background: palette.map((color, index) => {
        const next = palette[(index + 1) % palette.length];
        return `linear-gradient(to right, ${color}, ${next})`;
      }),
      transition: bounce,
    },
    static: { background: staticBackground },
  };

  const blurPx = typeof blur === 'number' ? blur : BLUR_PX[blur];
  const animation: GlowAnimation = shouldReduceMotion
    ? { background: staticBackground }
    : animations[mode];

  return (
    <motion.div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      style={{
        ...style,
        scale,
        filter: `blur(${blurPx}px)`,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      animate={animation}
    />
  );
}
