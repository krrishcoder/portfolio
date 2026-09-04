'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  motion,
  type Transition,
} from 'motion/react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/use-reduced-motion';

type ElementProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export type MorphingDialogProps = {
  children: React.ReactNode;
  transition?: Transition;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
export type MorphingDialogTriggerProps = ElementProps;
export type MorphingDialogContainerProps = { children: React.ReactNode };
export type MorphingDialogContentProps = ElementProps;
export type MorphingDialogTitleProps = ElementProps;
export type MorphingDialogSubtitleProps = ElementProps;
export type MorphingDialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
  disableLayoutAnimation?: boolean;
};
export type MorphingDialogCloseProps = {
  children?: React.ReactNode;
  className?: string;
};

type MorphingDialogContextValue = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  transition: Transition;
};

const DEFAULT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 26,
};

const MorphingDialogContext =
  React.createContext<MorphingDialogContextValue | null>(null);

/** True only for subtrees rendered inside the dialog surface, so ids stay unique. */
const InsideDialogContext = React.createContext(false);

function useMorphingDialog(component: string): MorphingDialogContextValue {
  const context = React.useContext(MorphingDialogContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <MorphingDialog>.`);
  }
  return context;
}

function CloseIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function MorphingDialog({
  children,
  transition,
  defaultOpen = false,
  onOpenChange,
}: MorphingDialogProps): React.JSX.Element {
  const uniqueId = React.useId();
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const onOpenChangeRef = React.useRef(onOpenChange);
  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const isFirstRun = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    onOpenChangeRef.current?.(isOpen);
  }, [isOpen]);

  const value = React.useMemo<MorphingDialogContextValue>(
    () => ({
      isOpen,
      setIsOpen,
      uniqueId,
      triggerRef,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : (transition ?? DEFAULT_TRANSITION),
    }),
    [isOpen, shouldReduceMotion, transition, uniqueId],
  );

  return (
    <MorphingDialogContext.Provider value={value}>
      {children}
    </MorphingDialogContext.Provider>
  );
}

export function MorphingDialogTrigger({
  children,
  className,
  style,
}: MorphingDialogTriggerProps): React.JSX.Element {
  const { isOpen, setIsOpen, uniqueId, triggerRef, transition } =
    useMorphingDialog('MorphingDialogTrigger');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setIsOpen(true);
  };

  return (
    <motion.button
      ref={triggerRef}
      type="button"
      layoutId={`dialog-${uniqueId}`}
      layout
      transition={transition}
      className={cn('relative', className)}
      style={style}
      onClick={() => setIsOpen((open) => !open)}
      onKeyDown={handleKeyDown}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={
        isOpen ? `morphing-dialog-content-${uniqueId}` : undefined
      }
    >
      {children}
    </motion.button>
  );
}

export function MorphingDialogContainer({
  children,
}: MorphingDialogContainerProps): React.JSX.Element {
  const { isOpen, setIsOpen, uniqueId, triggerRef, transition } =
    useMorphingDialog('MorphingDialogContainer');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Escape closes.
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  // Lock body scroll while open, restore the previous value on close.
  React.useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Return focus to the trigger when the dialog closes.
  React.useEffect(() => {
    if (!isOpen) return;
    return () => {
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen, triggerRef]);

  if (!isMounted) return <></>;

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen ? (
        <React.Fragment key={`morphing-dialog-${uniqueId}`}>
          <motion.div
            key={`backdrop-${uniqueId}`}
            className="fixed inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onClick={() => setIsOpen(false)}
          />
          {/* pointer-events-none so that a click on the dimmed area falls
              through to the backdrop above, which owns light dismiss. The
              content surface turns pointer events back on for itself. */}
          <div
            key={`wrapper-${uniqueId}`}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <InsideDialogContext.Provider value={true}>
              {children}
            </InsideDialogContext.Provider>
          </div>
        </React.Fragment>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function MorphingDialogContent({
  children,
  className,
  style,
}: MorphingDialogContentProps): React.JSX.Element {
  const { uniqueId, transition } = useMorphingDialog('MorphingDialogContent');
  const contentRef = React.useRef<HTMLDivElement>(null);

  // The dialog surface only mounts while open, so focus it on mount.
  React.useEffect(() => {
    contentRef.current?.focus({ preventScroll: true });
  }, []);

  // aria-modal only tells assistive tech that the rest of the page is
  // unavailable; it does not make Tab obey. Without this, Tab walks out of the
  // dialog and into the page behind the backdrop, where the focus ring is
  // invisible. Cycle within the surface instead.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;

    const root = contentRef.current;
    if (!root) return;

    // getClientRects covers SVG, which has no offsetParent.
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((node) => node.getClientRects().length > 0);

    if (focusable.length === 0) {
      event.preventDefault();
      root.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;

    if (event.shiftKey) {
      if (current === first || current === root) {
        event.preventDefault();
        last?.focus();
      }
      return;
    }

    if (current === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <motion.div
      ref={contentRef}
      id={`morphing-dialog-content-${uniqueId}`}
      layoutId={`dialog-${uniqueId}`}
      layout
      transition={transition}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`morphing-dialog-title-${uniqueId}`}
      aria-describedby={`morphing-dialog-description-${uniqueId}`}
      onKeyDown={handleKeyDown}
      // pointer-events-auto because the centring wrapper is pointer-events-none,
      // so that clicks landing outside this surface reach the backdrop.
      className={cn('pointer-events-auto relative overflow-hidden', className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogTitle({
  children,
  className,
  style,
}: MorphingDialogTitleProps): React.JSX.Element {
  const { uniqueId, transition } = useMorphingDialog('MorphingDialogTitle');
  const isInsideDialog = React.useContext(InsideDialogContext);

  return (
    <motion.div
      layoutId={`dialog-title-container-${uniqueId}`}
      layout
      transition={transition}
      id={isInsideDialog ? `morphing-dialog-title-${uniqueId}` : undefined}
      className={cn(className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogSubtitle({
  children,
  className,
  style,
}: MorphingDialogSubtitleProps): React.JSX.Element {
  const { uniqueId, transition } = useMorphingDialog('MorphingDialogSubtitle');

  return (
    <motion.div
      layoutId={`dialog-subtitle-container-${uniqueId}`}
      layout
      transition={transition}
      className={cn(className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogDescription({
  children,
  className,
  disableLayoutAnimation,
}: MorphingDialogDescriptionProps): React.JSX.Element {
  const { uniqueId, transition } = useMorphingDialog(
    'MorphingDialogDescription',
  );
  const isInsideDialog = React.useContext(InsideDialogContext);

  return (
    <motion.div
      key={`dialog-description-${uniqueId}`}
      layoutId={
        disableLayoutAnimation
          ? undefined
          : `dialog-description-content-${uniqueId}`
      }
      id={isInsideDialog ? `morphing-dialog-description-${uniqueId}` : undefined}
      className={cn(className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogClose({
  children,
  className,
}: MorphingDialogCloseProps): React.JSX.Element {
  const { setIsOpen, transition } = useMorphingDialog('MorphingDialogClose');

  return (
    <motion.button
      type="button"
      aria-label="Close dialog"
      className={cn('absolute right-4 top-4', className)}
      onClick={() => setIsOpen(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      {children ?? <CloseIcon />}
    </motion.button>
  );
}
