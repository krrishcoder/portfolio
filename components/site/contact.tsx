'use client';

import * as React from 'react';
import { motion, useInView } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { Magnetic } from '@/components/motion-primitives/magnetic';
import { GlowEffect } from '@/components/motion-primitives/glow-effect';
import { TextScramble } from '@/components/motion-primitives/text-scramble';
import { profile } from '@/lib/data';

const ENTRIES: { key: string; value: string; href: string; primary?: boolean }[] =
  [
    {
      key: 'email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      primary: true,
    },
    {
      key: 'phone',
      value: profile.phone,
      href: `tel:${profile.phone.replace(/\s+/g, '')}`,
    },
    {
      key: 'github',
      value: `github.com/${profile.handle}`,
      href: profile.github,
    },
    {
      key: 'linkedin',
      value: 'in/krishna-kumar-549894219',
      href: profile.linkedin,
    },
  ];

/**
 * Contact as terminal output rather than a form. Nothing here needs a server,
 * and a form would be a worse experience than a mail client the reader already
 * has open.
 */
export function Contact() {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="max-w-2xl">
      <div className="border border-rule bg-plate/60">
        {/* Set dressing. The prompt string is not information a reader needs
            announced before the contact details themselves. */}
        <div
          aria-hidden="true"
          className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2.5"
        >
          <p className="font-mono text-[0.7rem] text-dim">
            {profile.handle}@portfolio:~
          </p>
          <p className="font-mono text-[0.68rem] text-faint">sh</p>
        </div>

        <div className="px-4 py-5 sm:px-5">
          <p className="flex gap-2 font-mono text-[0.8rem]">
            <span aria-hidden="true" className="text-sodium">
              $
            </span>
            <TextScramble
              as="span"
              trigger={isInView}
              duration={0.7}
              speed={0.03}
              className="text-ink"
            >
              cat contact.json
            </TextScramble>
          </p>

          <dl className="mt-4 space-y-2.5">
            {ENTRIES.map((entry, index) => (
              <motion.div
                key={entry.key}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                animate={
                  isInView || shouldReduceMotion
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -6 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.35,
                  delay: shouldReduceMotion ? 0 : 0.45 + index * 0.09,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="grid gap-x-3 gap-y-0.5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-baseline"
              >
                <dt className="font-mono text-[0.76rem] text-faint">
                  {entry.key}
                </dt>
                <dd className="min-w-0">
                  {/* div, not span: both GlowEffect and Magnetic render a
                      motion.div, and <dd> takes flow content anyway. */}
                  <div className="relative inline-block">
                    {entry.primary && !shouldReduceMotion ? (
                      <GlowEffect
                        mode="breathe"
                        blur="strong"
                        duration={4.5}
                        colors={['#8a5f1f', '#4c5590']}
                        className="pointer-events-none -z-10 opacity-40"
                      />
                    ) : null}
                    <Magnetic intensity={0.4} range={90}>
                      <a
                        href={entry.href}
                        target={
                          entry.href.startsWith('http') ? '_blank' : undefined
                        }
                        rel={
                          entry.href.startsWith('http')
                            ? 'noreferrer noopener'
                            : undefined
                        }
                        className="inline-block break-all border-b border-rule-hi pb-0.5 font-mono text-[0.85rem] text-ink transition-colors duration-200 hover:border-sodium hover:text-sodium"
                      >
                        {entry.value}
                      </a>
                    </Magnetic>
                  </div>
                </dd>
              </motion.div>
            ))}
          </dl>

          <p className="mt-5 flex items-center gap-2 font-mono text-[0.8rem]">
            <span aria-hidden="true" className="text-sodium">
              $
            </span>
            {shouldReduceMotion ? null : (
              <motion.span
                aria-hidden="true"
                className="inline-block h-[0.95em] w-[0.5ch] bg-dim"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  times: [0, 0.5, 0.5, 1],
                }}
              />
            )}
          </p>
        </div>
      </div>

      <p className="mt-5 max-w-[58ch] text-[0.875rem] leading-relaxed text-faint text-pretty">
        Based in {profile.location}, working in ap-south-1 hours. Email is the
        fastest route; I read it before anything else.
      </p>
    </div>
  );
}
