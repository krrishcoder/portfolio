'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { education } from '@/lib/data';

/**
 * Résumé items that are not systems. Kept short deliberately — this is the part
 * of the page a reader scans rather than studies.
 */
const ROLES: { title: string; detail: string }[] = [
  {
    title: 'Event Organizer Head',
    detail:
      "Ran the college's first Robo Race at the Sankalan 2025 technical festival, from format and rules through to running the event on the day.",
  },
  {
    title: 'Peer Mentor',
    detail:
      'Mentored junior students on coursework and programming, mostly on getting from a working script to something maintainable.',
  },
  {
    title: 'Robotics and Technical Club',
    detail:
      'Member of the robotics and technical clubs, building hardware projects alongside the software work.',
  },
];

export function Credentials() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
      <section>
        <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-dim">
          Education
        </h3>

        <ul className="mt-5 border-t border-rule">
          {education.map((entry, index) => (
            <motion.li
              key={`${entry.year}-${entry.qualification}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.4,
                delay: index * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="grid gap-x-5 gap-y-1 border-b border-rule py-4 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-baseline"
            >
              <span className="font-mono text-[0.76rem] text-faint">
                {entry.year}
              </span>
              <span>
                <span className="block font-mono text-[0.9rem] text-ink">
                  {entry.qualification}
                </span>
                <span className="mt-0.5 block text-[0.8rem] text-faint">
                  {entry.institute}
                </span>
              </span>
              <span className="font-mono text-[0.78rem] text-sodium sm:text-right">
                {entry.score}
              </span>
            </motion.li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-dim">
          Beyond the codebase
        </h3>

        <ul className="mt-5 space-y-5">
          {ROLES.map((role, index) => (
            <motion.li
              key={role.title}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.4,
                delay: index * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-l border-rule-hi pl-4"
            >
              <p className="font-mono text-[0.88rem] text-ink">{role.title}</p>
              <p className="mt-1.5 max-w-[52ch] text-[0.85rem] leading-relaxed text-faint text-pretty">
                {role.detail}
              </p>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
