'use client';

import * as React from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';

export type PresetType = 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide';
export type PerType = 'word' | 'char' | 'line';

export type TextEffectProps = {
  children: string;
  per?: PerType;
  as?: keyof React.JSX.IntrinsicElements;
  variants?: { container?: Variants; item?: Variants };
  className?: string;
  preset?: PresetType;
  delay?: number;
  speedReveal?: number;
  speedSegment?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  segmentWrapperClassName?: string;
  style?: React.CSSProperties;
};

type VariantRecord = Record<string, unknown>;

/** Non-breaking space so whitespace-only segments never collapse. */
const NBSP = ' ';
const STAGGER: Record<PerType, number> = { char: 0.03, word: 0.05, line: 0.1 };
const BLUR = { opacity: 0, filter: 'blur(12px)' };

const PRESETS: Record<PresetType, Variants> = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } },
  blur: { hidden: BLUR, visible: { opacity: 1, filter: 'blur(0px)' }, exit: BLUR },
  'fade-in-blur': {
    hidden: { ...BLUR, y: 20 },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { ...BLUR, y: 20 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  slide: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
};

const FADE_ONLY: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Merges computed transitions into `visible`/`exit` without fighting `Variants`. */
function withTransitions(
  base: Variants,
  visible: VariantRecord,
  exit: VariantRecord,
): Variants {
  const source = base as Record<string, VariantRecord | undefined>;
  return {
    ...base,
    visible: { ...(source.visible ?? {}), transition: visible },
    exit: { ...(source.exit ?? {}), transition: exit },
  } as Variants;
}

const toVisible = (value: string): string =>
  value.length > 0 && value.trim().length === 0 ? NBSP.repeat(value.length) : value;

function Segment({
  segment,
  per,
  variants,
  wrapperClassName,
}: {
  segment: string;
  per: PerType;
  variants: Variants;
  wrapperClassName?: string;
}): React.JSX.Element {
  const inner =
    per === 'line' ? (
      <motion.span variants={variants} className="block">
        {segment}
      </motion.span>
    ) : per === 'word' ? (
      <motion.span variants={variants} className="inline-block whitespace-pre">
        {toVisible(segment)}
      </motion.span>
    ) : (
      <span className="inline-block whitespace-pre">
        {Array.from(segment).map((char, charIndex) => (
          <motion.span
            key={`char-${charIndex}`}
            variants={variants}
            className="inline-block whitespace-pre"
          >
            {toVisible(char)}
          </motion.span>
        ))}
      </span>
    );

  return (
    <span
      aria-hidden="true"
      className={cn(per === 'line' ? 'block' : 'inline-block', wrapperClassName)}
    >
      {inner}
    </span>
  );
}

export function TextEffect({
  children,
  per = 'word',
  as = 'p',
  variants,
  className,
  preset = 'fade',
  delay = 0,
  speedReveal = 1,
  speedSegment = 1,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  segmentWrapperClassName,
  style,
}: TextEffectProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = React.useMemo(
    () => motion.create(as as 'div') as typeof motion.div,
    [as],
  );

  const segments = React.useMemo(
    () => (per === 'line' ? children.split('\n') : children.split(/(\s+)/)),
    [children, per],
  );

  const stagger = shouldReduceMotion
    ? 0
    : STAGGER[per] / Math.max(speedReveal, 0.01);
  const duration = shouldReduceMotion ? 0 : 0.3 / Math.max(speedSegment, 0.01);

  const containerVariants = withTransitions(
    variants?.container ?? { hidden: {}, visible: {}, exit: {} },
    { staggerChildren: stagger, delayChildren: delay },
    { staggerChildren: stagger, staggerDirection: -1 },
  );
  const itemVariants = withTransitions(
    variants?.item ?? (shouldReduceMotion ? FADE_ONLY : PRESETS[preset]),
    { duration },
    { duration },
  );

  return (
    <AnimatePresence mode="popLayout">
      {trigger ? (
        <MotionTag
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className={className}
          style={style}
          onAnimationComplete={onAnimationComplete}
          onAnimationStart={onAnimationStart}
        >
          <span className="sr-only">{children}</span>
          {segments.map((segment, index) => (
            <Segment
              key={`${per}-${index}`}
              segment={segment}
              per={per}
              variants={itemVariants}
              wrapperClassName={segmentWrapperClassName}
            />
          ))}
        </MotionTag>
      ) : null}
    </AnimatePresence>
  );
}
