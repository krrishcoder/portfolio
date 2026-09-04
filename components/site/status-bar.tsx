'use client';

import * as React from 'react';
import { ScrollProgress } from '@/components/motion-primitives/scroll-progress';
import { AnimatedBackground } from '@/components/motion-primitives/animated-background';
import { profile } from '@/lib/data';

const NAV = [
  { id: 'hero', label: 'index' },
  { id: 'experience', label: 'experience' },
  { id: 'systems', label: 'systems' },
  { id: 'architecture', label: 'architecture' },
  { id: 'stack', label: 'stack' },
  { id: 'contact', label: 'contact' },
];

function useClock(): string {
  const [time, setTime] = React.useState('');

  React.useEffect(() => {
    const tick = () => {
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }).format(new Date()),
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

function useActiveSection(ids: string[]): string {
  const [active, setActive] = React.useState(ids[0]);

  React.useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.05, 0.25, 0.6] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const NAV_IDS = NAV.map((item) => item.id);

/**
 * Persistent ops bar. Everything in it is real state: local time in the timezone
 * he works from, the section you are currently reading, and how far down you are.
 */
export function StatusBar() {
  const time = useClock();
  const active = useActiveSection(NAV_IDS);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-rule bg-void/85 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <a
          href="#hero"
          className="flex shrink-0 items-center gap-2 font-mono text-xs text-ink"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
          </span>
          {profile.handle}
        </a>

        <nav
          aria-label="Sections"
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex"
        >
          <AnimatedBackground
            defaultValue={active}
            className="rounded-sm border border-indigo-dim bg-indigo/10"
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {NAV.map((item) => (
              <a
                key={item.id}
                data-id={item.id}
                href={`#${item.id}`}
                // The moving highlight is the sighted cue for "you are here";
                // aria-current is the only thing carrying that same fact into the
                // accessibility tree.
                aria-current={active === item.id ? 'true' : undefined}
                className="px-2.5 py-1 font-mono text-[0.72rem] text-dim transition-colors duration-200 hover:text-ink data-[checked=true]:text-ink"
              >
                {item.label}
              </a>
            ))}
          </AnimatedBackground>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 font-mono text-[0.7rem] text-faint md:ml-0">
          <span className="hidden sm:inline">ap-south-1</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-rule sm:block" />
          <span className="nums tabular-nums text-dim" suppressHydrationWarning>
            {time || '--:--:--'} IST
          </span>
        </div>
      </div>

      <ScrollProgress className="absolute inset-x-0 bottom-0 h-px bg-sodium" />
    </header>
  );
}
