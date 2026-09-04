'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { InView } from '@/components/motion-primitives/in-view';

export type SectionProps = {
  id: string;
  /** Path-style address shown in the left gutter. Acts as the section key. */
  path: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Section shell. The left gutter carries a path-style address instead of a
 * decorative number, so the marker actually tells you where you are.
 */
export function Section({
  id,
  path,
  title,
  lede,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-24 border-t border-rule px-5 py-20 sm:px-8 md:py-28',
        className,
      )}
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-xs text-faint">{path}</p>
        </div>

        <div>
          <InView
            once
            viewOptions={{ margin: '0px 0px -12% 0px', amount: 0.15 }}
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-mono text-slab text-ink">{title}</h2>
            {lede ? (
              <p className="mt-4 max-w-[62ch] text-[0.975rem] leading-relaxed text-dim text-pretty">
                {lede}
              </p>
            ) : null}
          </InView>

          <div className="mt-10">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Small labelled runtime fact. Used inside panels and dialog headers. */
export function Fact({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[0.68rem] tracking-wide text-faint">
        {label}
      </dt>
      <dd
        className={cn(
          'mt-1 truncate font-mono text-[0.8rem]',
          accent ? 'text-sodium' : 'text-ink',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
