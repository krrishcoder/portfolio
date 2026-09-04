'use client';

import * as React from 'react';
import {
  AnimatePresence,
  motion,
  type Transition,
} from 'motion/react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/use-reduced-motion';

type AnimatedBackgroundChild = React.ReactElement<{
  'data-id': string;
  className?: string;
  children?: React.ReactNode;
}>;

export type AnimatedBackgroundProps = {
  children: AnimatedBackgroundChild[] | AnimatedBackgroundChild;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps): React.JSX.Element {
  const uniqueId = React.useId();
  const shouldReduceMotion = useReducedMotion();
  const [activeId, setActiveId] = React.useState<string | null>(
    defaultValue ?? null,
  );

  React.useEffect(() => {
    if (defaultValue !== undefined) setActiveId(defaultValue);
  }, [defaultValue]);

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);
    onValueChange?.(id);
  };

  const items = React.Children.toArray(children).filter(
    (child): child is AnimatedBackgroundChild => React.isValidElement(child),
  );

  return (
    <>
      {items.map((child, index) => {
        const id = child.props['data-id'];
        const interaction = enableHover
          ? {
              onMouseEnter: () => handleSetActiveId(id),
              onMouseLeave: () => handleSetActiveId(null),
            }
          : { onClick: () => handleSetActiveId(id) };

        const clonedProps = {
          key: child.key ?? index,
          className: cn('relative inline-flex', child.props.className),
          'data-checked': activeId === id ? 'true' : 'false',
          ...interaction,
        };

        return React.cloneElement(
          child,
          clonedProps,
          <>
            <AnimatePresence initial={false}>
              {activeId === id ? (
                <motion.span
                  key={`background-${uniqueId}`}
                  layoutId={`background-${uniqueId}`}
                  className={cn('absolute inset-0 block', className)}
                  transition={shouldReduceMotion ? { duration: 0 } : transition}
                  initial={{ opacity: defaultValue ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : null}
            </AnimatePresence>
            {/* span, not div: callers wrap this around <button>, whose content
                model is phrasing content only. */}
            <span className="relative z-10">{child.props.children}</span>
          </>,
        );
      })}
    </>
  );
}
