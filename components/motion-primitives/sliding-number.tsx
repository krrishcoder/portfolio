'use client';

import * as React from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';

export type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
  decimalSeparator?: string;
  className?: string;
};

const SPRING = { stiffness: 280, damping: 18, mass: 0.3 };
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** One digit slot: a 1em window over a 10-digit column translated by `-digit em`. */
function Digit({ digit }: { digit: number }): React.JSX.Element {
  const spring = useSpring(digit, SPRING);
  const y = useTransform(spring, (latest) => `${-latest}em`);

  React.useEffect(() => {
    spring.set(digit);
  }, [digit, spring]);

  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden align-bottom">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        style={{ y }}
      >
        {DIGITS.map((candidate) => (
          <span
            key={candidate}
            className="flex h-[1em] w-full items-center justify-center"
          >
            {candidate}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = '.',
  className,
}: SlidingNumberProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const isNegative = value < 0;
  const [rawInteger, rawDecimal] = Math.abs(value).toString().split('.');
  const integerPart =
    padStart && rawInteger.length < 2 ? rawInteger.padStart(2, '0') : rawInteger;
  const decimalPart = rawDecimal ?? '';
  const formatted = `${isNegative ? '-' : ''}${integerPart}${
    decimalPart ? `${decimalSeparator}${decimalPart}` : ''
  }`;

  const wrapperClassName = cn(
    'inline-flex items-baseline leading-none tabular-nums',
    className,
  );

  if (shouldReduceMotion) {
    return <span className={wrapperClassName}>{formatted}</span>;
  }

  return (
    <span className={wrapperClassName}>
      <span className="sr-only">{formatted}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {isNegative ? <span>-</span> : null}
        {Array.from(integerPart).map((digit, index) => (
          <Digit key={`integer-${index}`} digit={Number(digit)} />
        ))}
        {decimalPart ? (
          <>
            <span>{decimalSeparator}</span>
            {Array.from(decimalPart).map((digit, index) => (
              <Digit key={`decimal-${index}`} digit={Number(digit)} />
            ))}
          </>
        ) : null}
      </span>
    </span>
  );
}
