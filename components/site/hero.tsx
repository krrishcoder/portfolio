'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { TextLoop } from '@/components/motion-primitives/text-loop';
import { Magnetic } from '@/components/motion-primitives/magnetic';
import { Spotlight } from '@/components/motion-primitives/spotlight';
import { ServiceRegistry } from '@/components/site/service-registry';
import { profile } from '@/lib/data';

const LINKS = [
  { label: profile.email, href: `mailto:${profile.email}` },
  { label: 'github.com/krrishcoder', href: profile.github },
  { label: 'linkedin', href: profile.linkedin },
];

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative scroll-mt-24 px-5 pb-16 pt-28 sm:px-8 md:pb-24 md:pt-36"
    >
      <Spotlight
        size={520}
        className="bg-[radial-gradient(circle_at_center,rgba(124,140,255,0.14),transparent_68%)]"
      />

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-14">
        <div>
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-xs text-faint"
          >
            {profile.degree}, working from {profile.location}
          </motion.p>

          <TextEffect
            as="h1"
            per="char"
            preset="fade-in-blur"
            delay={0.15}
            speedReveal={2.4}
            className="mt-5 font-mono text-hero text-ink"
          >
            {profile.name}
          </TextEffect>

          {/* The rotating loop is the page's thesis: not a job title, a list of
              the kinds of systems he actually ships. */}
          <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xl sm:text-2xl">
            <motion.span
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="text-dim"
            >
              I build
            </motion.span>
            <TextLoop className="text-sodium" interval={2.4}>
              {profile.roles.map((role) => (
                <span key={role}>{role}</span>
              ))}
            </TextLoop>
            {shouldReduceMotion ? null : (
              <motion.span
                aria-hidden="true"
                className="inline-block h-[0.95em] w-[0.5ch] bg-sodium"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
              />
            )}
          </div>

          <div className="mt-9 max-w-[64ch] space-y-4">
            {profile.intro.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: 1.0 + index * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-[0.975rem] leading-relaxed text-dim text-pretty"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <motion.ul
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.35 }}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {LINKS.map((link) => (
              <li key={link.href}>
                <Magnetic intensity={0.35} range={80}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      link.href.startsWith('http')
                        ? 'noreferrer noopener'
                        : undefined
                    }
                    className="border-b border-rule-hi pb-0.5 font-mono text-[0.8rem] text-ink transition-colors duration-200 hover:border-sodium hover:text-sodium"
                  >
                    {link.label}
                  </a>
                </Magnetic>
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="lg:pt-3">
          <ServiceRegistry />
        </div>
      </div>
    </section>
  );
}
