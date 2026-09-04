'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { InView } from '@/components/motion-primitives/in-view';
import { TextShimmer } from '@/components/motion-primitives/text-shimmer';
import { experience } from '@/lib/data';

/**
 * Work history rendered as a deployment log: each role is an entry with a
 * time range, a growing left rule, and the lines it produced. The newest entry
 * is still running, so its end marker shimmers instead of sitting static.
 */
export function DeploymentLog() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <ol className="space-y-0">
      {experience.map((job, index) => {
        const isCurrent = job.end.toLowerCase() === 'present';

        return (
          <li
            key={`${job.company}-${job.start}`}
            className="border-t border-rule py-9 first:border-t-0 first:pt-0 last:pb-0"
          >
            <InView
              once
              viewOptions={{ margin: '0px 0px -10% 0px', amount: 0.2 }}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.55,
                delay: shouldReduceMotion ? 0 : index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="font-mono text-lg text-ink sm:text-xl">
                  {job.company}
                </h3>
                <p className="font-mono text-[0.74rem] text-faint">
                  {job.start} <span aria-hidden="true">—</span>{' '}
                  {isCurrent && !shouldReduceMotion ? (
                    // Colours are props now, not CSS variables set by class: the
                    // glyphs are painted through background-clip, so a base
                    // colour that loses to class ordering means invisible text.
                    <TextShimmer
                      as="span"
                      duration={2.6}
                      baseColor="#c98b2e"
                      shimmerColor="#ffb547"
                    >
                      present
                    </TextShimmer>
                  ) : (
                    <span className={isCurrent ? 'text-sodium' : undefined}>
                      {job.end}
                    </span>
                  )}
                </p>
              </div>

              <p className="mt-1.5 text-[0.9rem] text-dim">{job.role}</p>

              <div className="mt-5 flex gap-4 sm:gap-6">
                <motion.span
                  aria-hidden="true"
                  className="w-px shrink-0 origin-top bg-rule-hi"
                  initial={shouldReduceMotion ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.7,
                    delay: shouldReduceMotion ? 0 : 0.15 + index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />

                <ul className="max-w-[74ch] space-y-2.5">
                  {job.lines.map((line, lineIndex) => (
                    <motion.li
                      key={line}
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.4,
                        delay: shouldReduceMotion ? 0 : 0.2 + lineIndex * 0.07,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex gap-3 text-[0.925rem] leading-relaxed text-dim text-pretty"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.45rem] h-1 w-1 shrink-0 bg-indigo-dim"
                      />
                      <span>{line}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
                {job.stack.map((item) => (
                  <li
                    key={item}
                    className="border border-rule px-2 py-0.5 font-mono text-[0.68rem] text-faint transition-colors duration-200 hover:border-rule-hi hover:text-dim"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </InView>
          </li>
        );
      })}
    </ol>
  );
}
