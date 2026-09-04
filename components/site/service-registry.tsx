'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { BorderTrail } from '@/components/motion-primitives/border-trail';
import { StatusDot, statusLabel } from '@/components/site/status-dot';
import { serviceRegistry } from '@/lib/data';

/**
 * The hero's right-hand panel: a service registry rather than a headshot or a
 * hero stat. It boots in as a log on page load, which is the one orchestrated
 * motion moment on first paint.
 */
export function ServiceRegistry() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden border border-rule bg-plate/70 backdrop-blur-sm">
      <BorderTrail
        size={90}
        className="text-sodium/50"
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      />

      <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2.5">
        <p className="font-mono text-[0.72rem] text-dim">service registry</p>
        <p className="font-mono text-[0.68rem] text-faint">
          {serviceRegistry.length} entries
        </p>
      </div>

      <ul className="divide-y divide-rule">
        {serviceRegistry.map((service, index) => (
          <motion.li
            key={service.slug}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.42,
              delay: shouldReduceMotion ? 0 : 0.85 + index * 0.11,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <a
              href="#systems"
              className="group flex items-center gap-3 px-4 py-2.5 transition-colors duration-200 hover:bg-plate-hi"
            >
              <StatusDot status={service.status} />
              {/* The dot is aria-hidden, so without this the entry's state is
                  carried by hue alone and is absent from the a11y tree. */}
              <span className="sr-only">{statusLabel(service.status)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[0.8rem] text-ink">
                  {service.name}
                </span>
                <span className="block truncate text-[0.72rem] text-faint">
                  {service.runtime}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[0.72rem] text-dim group-hover:text-sodium">
                :{service.port}
              </span>
            </a>
          </motion.li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-rule px-4 py-2.5">
        <p className="font-mono text-[0.68rem] text-faint">
          {serviceRegistry.filter((s) => s.status === 'production').length}{' '}
          {statusLabel('production')}
        </p>
        <p className="font-mono text-[0.68rem] text-faint">health check ok</p>
      </div>
    </div>
  );
}
