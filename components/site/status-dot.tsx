'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';
import type { ProjectStatus } from '@/lib/data';

const LABELS: Record<ProjectStatus, string> = {
  production: 'live',
  building: 'building',
  shipped: 'shipped',
  research: 'research',
};

const DOT: Record<ProjectStatus, string> = {
  production: 'bg-live',
  building: 'bg-sodium',
  shipped: 'bg-dim',
  research: 'bg-indigo',
};

const TEXT: Record<ProjectStatus, string> = {
  production: 'text-live',
  building: 'text-sodium',
  shipped: 'text-dim',
  research: 'text-indigo',
};

export function statusLabel(status: ProjectStatus): string {
  return LABELS[status];
}

/**
 * Liveness indicator. Only `production` pulses, because the pulse is meant to
 * mean "this is answering requests right now" rather than "look here".
 */
export function StatusDot({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const isLive = status === 'production';

  return (
    <span
      className={cn('relative flex h-1.5 w-1.5 shrink-0', className)}
      aria-hidden="true"
    >
      {isLive && !shouldReduceMotion ? (
        <motion.span
          className="absolute inset-0 rounded-full bg-live"
          animate={{ opacity: [0.65, 0, 0.65], scale: [1, 2.4, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
      ) : null}
      <span className={cn('relative h-1.5 w-1.5 rounded-full', DOT[status])} />
    </span>
  );
}

export function StatusTag({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[0.7rem]',
        TEXT[status],
        className,
      )}
    >
      <StatusDot status={status} />
      {LABELS[status]}
    </span>
  );
}
