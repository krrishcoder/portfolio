'use client';

import * as React from 'react';
import { motion, useInView } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import {
  MorphingDialog,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTrigger,
} from '@/components/motion-primitives/morphing-dialog';
import { ProjectDetail } from '@/components/site/project-detail';
import { StatusDot, statusLabel } from '@/components/site/status-dot';
import { projects, type Project } from '@/lib/data';

const COLS =
  'grid grid-cols-[3.75rem_minmax(0,1fr)_5.5rem] items-center gap-x-4 md:grid-cols-[4.5rem_minmax(0,1.45fr)_minmax(0,1fr)_5.5rem]';

function Row({ project }: { project: Project }) {
  return (
    <span className={`${COLS} px-4 py-4 sm:px-5`}>
      <span className="font-mono text-[0.74rem] text-faint transition-colors duration-200 group-hover:text-sodium">
        {project.port ? `:${project.port}` : '—'}
      </span>

      <span className="min-w-0">
        <span className="block truncate font-mono text-[0.95rem] text-ink">
          {project.name}
        </span>
        <span className="mt-1 block text-[0.8rem] leading-snug text-faint md:truncate">
          {project.tagline}
        </span>
      </span>

      <span className="hidden min-w-0 md:block">
        <span className="block truncate font-mono text-[0.72rem] text-dim">
          {project.stack.slice(0, 3).join(' · ')}
        </span>
        <span className="mt-1 block font-mono text-[0.68rem] text-faint">
          {project.stack.length} components
        </span>
      </span>

      <span className="flex items-center justify-end gap-2">
        {/* sr-only rather than hidden below sm: the dot beside it is decorative,
            so dropping this span outright would leave status encoded in colour
            alone and missing from the accessibility tree at every width. */}
        <span className="sr-only font-mono text-[0.68rem] text-faint sm:not-sr-only sm:inline">
          {statusLabel(project.status)}
        </span>
        <StatusDot status={project.status} />
      </span>
    </span>
  );
}

/**
 * The nine systems as a catalog rather than a card grid: one dense row each,
 * addressed by the port the service actually listens on. A row expands into the
 * full record instead of navigating away.
 */
export function ServiceCatalog() {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="relative border border-rule bg-plate/40">
      <div
        className={`${COLS} border-b border-rule px-4 py-2.5 sm:px-5`}
        aria-hidden="true"
      >
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-faint">
          addr
        </span>
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-faint">
          system
        </span>
        <span className="hidden font-mono text-[0.66rem] uppercase tracking-[0.16em] text-faint md:block">
          stack
        </span>
        <span className="text-right font-mono text-[0.66rem] uppercase tracking-[0.16em] text-faint">
          state
        </span>
      </div>

      {/* One scan down the list when it first appears, then the list is quiet. */}
      {isInView && !shouldReduceMotion ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 z-10 h-px bg-sodium"
          initial={{ top: '0%', opacity: 0 }}
          animate={{ top: '100%', opacity: [0, 0.85, 0.85, 0] }}
          transition={{
            duration: 1.15,
            ease: 'easeInOut',
            opacity: {
              duration: 1.15,
              ease: 'linear',
              times: [0, 0.12, 0.82, 1],
            },
          }}
        />
      ) : null}

      <ul>
        {projects.map((project, index) => (
          <motion.li
            key={project.slug}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={
              isInView || shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 6 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.4,
              delay: shouldReduceMotion ? 0 : index * 0.055,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <MorphingDialog
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            >
              <MorphingDialogTrigger className="group block w-full border-t border-rule bg-transparent text-left transition-colors duration-200 hover:bg-plate-hi">
                <Row project={project} />
              </MorphingDialogTrigger>

              <MorphingDialogContainer>
                <MorphingDialogContent className="mx-3 h-[88vh] w-full max-w-[62rem] border border-rule-hi bg-plate">
                  <ProjectDetail project={project} />
                </MorphingDialogContent>
              </MorphingDialogContainer>
            </MorphingDialog>
          </motion.li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-2.5 sm:px-5">
        <p className="font-mono text-[0.68rem] text-faint">
          {projects.length} systems · select a row for the full record
        </p>
        <p className="font-mono text-[0.68rem] text-faint">
          {projects.filter((p) => p.status === 'production').length} in production
        </p>
      </div>
    </div>
  );
}
