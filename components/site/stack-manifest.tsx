'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { stackGroups } from '@/lib/data';

/**
 * The stack as a manifest, grouped by the job each tool does rather than as one
 * undifferentiated wall of logos.
 */
export function StackManifest() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <dl className="border-t border-rule">
      {stackGroups.map((group) => (
        <div
          key={group.key}
          className="grid gap-x-6 gap-y-3 border-b border-rule py-6 sm:grid-cols-[10rem_minmax(0,1fr)]"
        >
          <dt>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-dim">
              {group.label}
            </p>
            <p className="mt-1 font-mono text-[0.68rem] text-faint">
              {group.items.length} entries
            </p>
          </dt>

          <dd>
            <ul className="flex flex-wrap gap-x-2 gap-y-2">
              {group.items.map((item, index) => (
                <motion.li
                  key={item}
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, y: 6, filter: 'blur(3px)' }
                  }
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.028,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border border-rule bg-plate/60 px-2.5 py-1 font-mono text-[0.74rem] text-dim transition-colors duration-200 hover:border-sodium-dim hover:text-sodium"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}
