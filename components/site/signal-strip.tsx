'use client';

import * as React from 'react';
import { animate, useInView } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { SlidingNumber } from '@/components/motion-primitives/sliding-number';
import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider';
import { metrics, stackGroups, type Metric } from '@/lib/data';

const MARQUEE = stackGroups.flatMap((group) => group.items);

function Counter({ metric }: { metric: Metric }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (shouldReduceMotion) {
      setDisplay(metric.value);
      return;
    }
    if (!isInView) return;

    const controls = animate(0, metric.value, {
      duration: 1.35,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, metric.value, shouldReduceMotion]);

  return (
    <div ref={ref} className="px-5 py-6 sm:px-6">
      <p className="flex items-baseline font-mono text-2xl text-ink sm:text-3xl">
        {metric.prefix ? <span>{metric.prefix}</span> : null}
        <SlidingNumber value={display} />
        {metric.suffix ? (
          <span className="text-sodium">{metric.suffix}</span>
        ) : null}
      </p>
      <p className="mt-2 text-[0.78rem] leading-snug text-faint">
        {metric.label}
      </p>
    </div>
  );
}

/**
 * A thin band between the hero and the log. The numbers here are the only
 * counters on the page and every one of them is a real quantity from the work.
 */
export function SignalStrip() {
  return (
    <div className="border-y border-rule bg-plate/40">
      <div className="mx-auto max-w-6xl">
        <div className="grid divide-y divide-rule border-x border-rule sm:grid-cols-2 sm:divide-x lg:grid-cols-5 lg:divide-y-0">
          {metrics.map((metric) => (
            <Counter key={metric.label} metric={metric} />
          ))}
        </div>
      </div>

      {/* aria-hidden because the stack section further down presents this exact
          list as a labelled group. Read here as well it would be forty terms in
          marquee order with no heading. The motion itself stops under
          prefers-reduced-motion via the global block in globals.css. */}
      <div
        aria-hidden="true"
        className="relative overflow-hidden border-t border-rule py-3"
      >
        <InfiniteSlider gap={40} speed={26} speedOnHover={8}>
          {MARQUEE.map((item) => (
            <span
              key={item}
              className="whitespace-nowrap font-mono text-[0.72rem] text-faint"
            >
              {item}
            </span>
          ))}
        </InfiniteSlider>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-void to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-void to-transparent" />
      </div>
    </div>
  );
}
