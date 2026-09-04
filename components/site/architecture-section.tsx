'use client';

import * as React from 'react';
import { AnimatedBackground } from '@/components/motion-primitives/animated-background';
import { TransitionPanel } from '@/components/motion-primitives/transition-panel';
import { ArchitectureDiagram } from '@/components/site/architecture-diagram';
import { diagramById } from '@/lib/diagrams';
import { projects } from '@/lib/data';

const ENTRIES = projects
  .filter((project) => Boolean(project.diagramId))
  .map((project) => {
    const diagram = diagramById(project.diagramId as string);
    return diagram ? { slug: project.slug, label: project.name, diagram } : null;
  })
  .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

const LEGEND: { swatch: string; text: string }[] = [
  { swatch: 'bg-sodium', text: 'computes or infers' },
  { swatch: 'bg-indigo', text: 'stores or moves bytes' },
  { swatch: 'bg-faint', text: 'outside my code' },
];

/**
 * Five topologies behind one switcher. Each diagram is the real shape of a
 * shipped system, so the switcher is the honest way to show them: side by side
 * they read as five answers to five different constraints.
 */
export function ArchitectureSection() {
  const [index, setIndex] = React.useState(0);
  const active = ENTRIES[Math.min(index, ENTRIES.length - 1)];

  if (!active) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <AnimatedBackground
          defaultValue={active.slug}
          onValueChange={(slug) => {
            const next = ENTRIES.findIndex((entry) => entry.slug === slug);
            if (next >= 0) setIndex(next);
          }}
          className="border border-indigo bg-indigo/10"
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        >
          {ENTRIES.map((entry) => (
            <button
              key={entry.slug}
              data-id={entry.slug}
              type="button"
              // The sliding panel is the only sighted cue for which diagram is
              // showing; aria-pressed is what carries that into the a11y tree.
              aria-pressed={entry.slug === active.slug}
              className="px-3 py-1.5 font-mono text-[0.75rem] text-faint transition-colors duration-200 hover:text-dim data-[checked=true]:text-ink"
            >
              {entry.label}
            </button>
          ))}
        </AnimatedBackground>
      </div>

      <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        {LEGEND.map((item) => (
          <li
            key={item.text}
            className="flex items-center gap-2 font-mono text-[0.68rem] text-faint"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-[3px] ${item.swatch}`}
            />
            {item.text}
          </li>
        ))}
        <li className="font-mono text-[0.68rem] text-faint">
          moving dots follow the direction of a request
        </li>
      </ul>

      <div className="mt-6">
        <TransitionPanel
          activeIndex={Math.min(index, ENTRIES.length - 1)}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {ENTRIES.map((entry) => (
            <div key={entry.slug}>
              <h3 className="mb-4 font-mono text-[0.95rem] text-ink">
                {entry.diagram.title}
              </h3>
              <ArchitectureDiagram diagram={entry.diagram} />
            </div>
          ))}
        </TransitionPanel>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] text-faint">
        hover or focus a box to read what it does · the board scrolls sideways
      </p>
    </div>
  );
}
