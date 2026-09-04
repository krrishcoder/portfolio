'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import {
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
} from '@/components/motion-primitives/morphing-dialog';
import { AnimatedBackground } from '@/components/motion-primitives/animated-background';
import { TransitionPanel } from '@/components/motion-primitives/transition-panel';
import { ArchitectureDiagram } from '@/components/site/architecture-diagram';
import { StatusTag } from '@/components/site/status-dot';
import { diagramById } from '@/lib/diagrams';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';
import type { Project } from '@/lib/data';

const METHOD: Record<string, string> = {
  GET: 'text-indigo',
  POST: 'text-sodium',
  PATCH: 'text-live',
  WS: 'text-warn',
};

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">
      {children}
    </h4>
  );
}

function Overview({ project }: { project: Project }) {
  return (
    <div className="space-y-9">
      <div className="max-w-[78ch] space-y-4">
        {project.summary.map((paragraph, index) => (
          <p
            key={index}
            className="text-[0.925rem] leading-relaxed text-dim text-pretty"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <section>
        <Heading>operational facts</Heading>
        <dl className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
          {project.flags.map((flag) => (
            <div key={flag.label} className="bg-plate px-3 py-2.5">
              <dt className="font-mono text-[0.68rem] text-faint">
                {flag.label}
              </dt>
              <dd className="mt-1 font-mono text-[0.8rem] text-ink">
                {flag.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <Heading>engineering notes</Heading>
        <ul className="max-w-[80ch] space-y-2.5">
          {project.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex gap-3 text-[0.9rem] leading-relaxed text-dim text-pretty"
            >
              <span
                aria-hidden="true"
                className="mt-[0.45rem] h-1 w-1 shrink-0 bg-sodium-dim"
              />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </section>

      {project.notes?.length ? (
        <section className="border-l-2 border-indigo-dim bg-plate-hi/60 px-4 py-3.5">
          <Heading>trade-offs and what is next</Heading>
          <ul className="max-w-[80ch] space-y-2">
            {project.notes.map((note) => (
              <li
                key={note}
                className="text-[0.86rem] leading-relaxed text-faint text-pretty"
              >
                {note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Interface({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      {project.endpoints?.map((group) => (
        <section key={group.group}>
          <Heading>{group.group}</Heading>
          <ul className="divide-y divide-rule border-y border-rule">
            {group.routes.map((route) => (
              <li
                key={`${route.method}-${route.path}`}
                className="grid gap-x-4 gap-y-1 py-2.5 sm:grid-cols-[3.25rem_minmax(0,1fr)_minmax(0,1.15fr)] sm:items-baseline"
              >
                <span
                  className={cn(
                    'font-mono text-[0.66rem] tracking-wider',
                    METHOD[route.method] ?? 'text-dim',
                  )}
                >
                  {route.method}
                </span>
                <span className="break-all font-mono text-[0.8rem] text-ink">
                  {route.path}
                </span>
                <span className="text-[0.8rem] leading-snug text-faint">
                  {route.note}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Stack({ project }: { project: Project }) {
  // The global prefers-reduced-motion block in globals.css clamps CSS animation
  // and transition durations, but it cannot touch the inline transforms motion
  // writes, so a JS-driven stagger has to opt out in JS.
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-8">
      <section>
        <Heading>stack</Heading>
        <ul className="flex flex-wrap gap-2">
          {project.stack.map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.3,
                delay: shouldReduceMotion ? 0 : index * 0.025,
              }}
              className="border border-rule px-2.5 py-1 font-mono text-[0.72rem] text-dim transition-colors duration-200 hover:border-sodium-dim hover:text-sodium"
            >
              {item}
            </motion.li>
          ))}
        </ul>
      </section>

      <section>
        <Heading>addressing</Heading>
        <dl className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
          <div className="bg-plate px-3 py-2.5">
            <dt className="font-mono text-[0.68rem] text-faint">Role</dt>
            <dd className="mt-1 text-[0.82rem] text-ink">{project.role}</dd>
          </div>
          <div className="bg-plate px-3 py-2.5">
            <dt className="font-mono text-[0.68rem] text-faint">Port</dt>
            <dd className="mt-1 font-mono text-[0.82rem] text-ink">
              {project.port ? `:${project.port}` : 'not a network service'}
            </dd>
          </div>
          {project.region ? (
            <div className="bg-plate px-3 py-2.5">
              <dt className="font-mono text-[0.68rem] text-faint">Region</dt>
              <dd className="mt-1 font-mono text-[0.82rem] text-ink">
                {project.region}
              </dd>
            </div>
          ) : null}
          <div className="bg-plate px-3 py-2.5">
            <dt className="font-mono text-[0.68rem] text-faint">Year</dt>
            <dd className="mt-1 font-mono text-[0.82rem] text-ink">
              {project.year}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export type ProjectDetailProps = { project: Project };

/**
 * Dialog body for one system. Tabs exist because these projects have four
 * genuinely different kinds of detail — prose, topology, request surface and
 * stack — and stacking all four vertically buries the diagram.
 */
export function ProjectDetail({ project }: ProjectDetailProps) {
  const diagram = project.diagramId ? diagramById(project.diagramId) : undefined;

  const tabs = React.useMemo(() => {
    const list: { id: string; label: string; node: React.ReactNode }[] = [
      { id: 'overview', label: 'overview', node: <Overview project={project} /> },
    ];
    if (diagram) {
      list.push({
        id: 'architecture',
        label: 'architecture',
        node: (
          <section>
            <Heading>{diagram.title}</Heading>
            <ArchitectureDiagram diagram={diagram} />
          </section>
        ),
      });
    }
    if (project.endpoints?.length) {
      list.push({
        id: 'interface',
        label: 'interface',
        node: <Interface project={project} />,
      });
    }
    list.push({ id: 'stack', label: 'stack', node: <Stack project={project} /> });
    return list;
  }, [diagram, project]);

  const [tab, setTab] = React.useState(0);
  const activeId = tabs[Math.min(tab, tabs.length - 1)]?.id ?? 'overview';

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* First in the DOM, not just first visually. It sits at the top right, so
          a keyboard user should reach it before working through the tabs. */}
      <MorphingDialogClose className="z-20 text-dim transition-colors duration-200 hover:text-ink" />

      <header className="shrink-0 border-b border-rule px-5 pb-4 pt-5 sm:px-7">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pr-10">
          <StatusTag status={project.status} />
          <span className="font-mono text-[0.72rem] text-faint">
            {project.year}
          </span>
          {project.port ? (
            <span className="font-mono text-[0.72rem] text-dim">
              :{project.port}
            </span>
          ) : null}
          {project.region ? (
            <span className="font-mono text-[0.72rem] text-faint">
              {project.region}
            </span>
          ) : null}
        </div>

        <MorphingDialogTitle className="mt-2.5">
          <h3 className="font-mono text-xl text-ink sm:text-2xl">
            {project.name}
          </h3>
        </MorphingDialogTitle>

        <MorphingDialogSubtitle>
          {/* The dialog's accessible description is this one line, not the tab
              panel below: aria-describedby is read straight through, and the
              panel is several thousand characters of prose, tables and route
              listings. */}
          <MorphingDialogDescription disableLayoutAnimation>
            <p className="mt-1.5 max-w-[70ch] text-[0.875rem] leading-snug text-dim text-pretty">
              {project.tagline}
            </p>
          </MorphingDialogDescription>
        </MorphingDialogSubtitle>

        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-block border-b border-rule-hi pb-0.5 font-mono text-[0.74rem] text-sodium transition-colors duration-200 hover:border-sodium"
          >
            open live surface ↗
          </a>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-1">
          <AnimatedBackground
            defaultValue={activeId}
            onValueChange={(id) => {
              const next = tabs.findIndex((item) => item.id === id);
              if (next >= 0) setTab(next);
            }}
            className="border border-indigo bg-indigo/10"
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {tabs.map((item) => (
              <button
                key={item.id}
                data-id={item.id}
                type="button"
                aria-pressed={item.id === activeId}
                className="px-3 py-1.5 font-mono text-[0.74rem] text-faint transition-colors duration-200 hover:text-dim data-[checked=true]:text-ink"
              >
                {item.label}
              </button>
            ))}
          </AnimatedBackground>
        </div>
      </header>

      {/* Focusable because it scrolls: the overview panel is long and contains
          no links of its own, so without a tab stop its overflow can only be
          reached with a pointer. */}
      <div
        tabIndex={0}
        role="group"
        aria-label={`${project.name}, ${activeId}`}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7"
      >
        <TransitionPanel
          activeIndex={Math.min(tab, tabs.length - 1)}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {tabs.map((item) => (
            <div key={item.id}>{item.node}</div>
          ))}
        </TransitionPanel>
      </div>
    </div>
  );
}
