'use client';

import * as React from 'react';
import { useReducedMotion as usePreference } from 'motion/react';

/**
 * Hydration-safe replacement for motion's `useReducedMotion`.
 *
 * The upstream hook reads `window.matchMedia` and therefore returns `null` on
 * the server but the real answer on the client's very first render. Anything
 * that branches on it — and most components here branch structurally, choosing
 * between a `motion.div` tree and a plain one — then renders differently during
 * hydration than it did during SSR, which is a hydration mismatch for exactly
 * the users who opted out of motion.
 *
 * So: report `false` for the first client render, matching the server, and flip
 * to the real preference in an effect. Reduced-motion users get one frame of the
 * animated tree before it is replaced. That frame costs nothing visually,
 * because the global `prefers-reduced-motion` block in globals.css has already
 * clamped every CSS animation and transition from the first paint, and motion's
 * own JS animations have not had time to advance.
 *
 * Returns a strict boolean rather than `boolean | null`, so call sites can use
 * it directly in a ternary without a null check.
 */
export function useReducedMotion(): boolean {
  const preference = usePreference();
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated && preference === true;
}
