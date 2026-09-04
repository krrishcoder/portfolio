'use client';

import * as React from 'react';
import { motion, useInView } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';
import type { Diagram, DiagramNode, DiagramNodeKind } from '@/lib/diagrams';

const CELL_W = 210;
const CELL_H = 116;
const NODE_W = 168;
const NODE_H = 60;
const PAD = 32;

type Point = { x: number; y: number };

type Box = { x: number; y: number; cx: number; cy: number };

function box(node: DiagramNode): Box {
  const x = PAD + node.col * CELL_W;
  const y = PAD + node.row * CELL_H;
  return { x, y, cx: x + NODE_W / 2, cy: y + NODE_H / 2 };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * One cubic curve per edge, anchored on the facing sides of the two nodes so
 * lines leave and arrive where a reader expects flow to go.
 */
function geometry(a: DiagramNode, b: DiagramNode): { d: string; mid: Point } {
  const A = box(a);
  const B = box(b);

  let p1: Point;
  let p2: Point;
  let c1: Point;
  let c2: Point;

  if (b.col !== a.col) {
    const rightward = b.col > a.col;
    p1 = { x: rightward ? A.x + NODE_W : A.x, y: A.cy };
    p2 = { x: rightward ? B.x : B.x + NODE_W, y: B.cy };
    const reach = Math.max(36, Math.abs(p2.x - p1.x) * 0.45) * (rightward ? 1 : -1);
    c1 = { x: p1.x + reach, y: p1.y };
    c2 = { x: p2.x - reach, y: p2.y };
  } else {
    const downward = b.row > a.row;
    p1 = { x: A.cx, y: downward ? A.y + NODE_H : A.y };
    p2 = { x: B.cx, y: downward ? B.y : B.y + NODE_H };
    const reach = Math.max(28, Math.abs(p2.y - p1.y) * 0.5) * (downward ? 1 : -1);
    c1 = { x: p1.x, y: p1.y + reach };
    c2 = { x: p2.x, y: p2.y - reach };
  }

  const mid: Point = {
    x: round(0.125 * p1.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * p2.x),
    y: round(0.125 * p1.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * p2.y),
  };

  const d = `M ${round(p1.x)} ${round(p1.y)} C ${round(c1.x)} ${round(c1.y)}, ${round(
    c2.x,
  )} ${round(c2.y)}, ${round(p2.x)} ${round(p2.y)}`;

  return { d, mid };
}

/**
 * Taxonomy is carried by a coloured edge bar and a small kind tag rather than by
 * giving every category its own hue: amber marks anything that computes or
 * infers, indigo anything that stores or moves bytes, grey anything external.
 */
const KIND: Record<DiagramNodeKind, { bar: string; tag: string }> = {
  client: { bar: 'fill-faint', tag: 'client' },
  'edge-net': { bar: 'fill-indigo', tag: 'network' },
  compute: { bar: 'fill-sodium', tag: 'compute' },
  store: { bar: 'fill-indigo', tag: 'database' },
  vector: { bar: 'fill-indigo', tag: 'vectors' },
  cache: { bar: 'fill-indigo', tag: 'cache' },
  external: { bar: 'fill-faint', tag: 'external' },
  llm: { bar: 'fill-sodium', tag: 'model' },
  queue: { bar: 'fill-faint', tag: 'artifact' },
};

export type ArchitectureDiagramProps = {
  diagram: Diagram;
  className?: string;
};

/**
 * Animated node and edge renderer. Packets travelling the edges are the only
 * looping motion, and they encode direction of flow, so the movement is
 * information rather than decoration.
 */
export function ArchitectureDiagram({
  diagram,
  className,
}: ArchitectureDiagramProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = React.useState<string | null>(null);

  const revealed = isInView || Boolean(shouldReduceMotion);

  const width = PAD * 2 + (diagram.cols - 1) * CELL_W + NODE_W;
  const height = PAD * 2 + (diagram.rows - 1) * CELL_H + NODE_H;

  const nodeById = React.useMemo(() => {
    const map = new Map<string, DiagramNode>();
    diagram.nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [diagram]);

  const edges = React.useMemo(
    () =>
      diagram.edges.flatMap((edge, index) => {
        const from = nodeById.get(edge.from);
        const to = nodeById.get(edge.to);
        if (!from || !to) return [];
        return [{ ...edge, index, ...geometry(from, to) }];
      }),
    [diagram, nodeById],
  );

  const connected = React.useMemo(() => {
    if (!active) return null;
    const ids = new Set<string>([active]);
    diagram.edges.forEach((edge) => {
      if (edge.from === active) ids.add(edge.to);
      if (edge.to === active) ids.add(edge.from);
    });
    return ids;
  }, [active, diagram]);

  const activeNode = active ? nodeById.get(active) : undefined;

  return (
    <div ref={ref} className={cn('w-full', className)}>
      <div
        // A horizontally scrolling region has to be operable from the keyboard,
        // or the overflow is simply unreachable without a pointer. This also
        // carries the diagram's accessible name.
        tabIndex={0}
        role="group"
        aria-label={`${diagram.title}. ${diagram.caption} Scrollable diagram.`}
        className="overflow-x-auto border border-rule bg-plate/50"
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          // No role or name here on purpose. The focusable wrapper above owns
          // the name and every node group owns its own; a third label would
          // make a reader hear the caption twice before reaching any content.
          role="presentation"
          className="max-w-none md:h-auto md:w-full"
        >
          <g>
            {edges.map((edge) => {
              const isLit = connected
                ? edge.from === active || edge.to === active
                : false;
              const isMuted = Boolean(connected) && !isLit;
              // Resting edges sit at `faint` rather than a hairline grey: an edge
              // is the load-bearing content of a diagram, not chrome, so it has
              // to clear the non-text contrast bar on its own. `rule` is reserved
              // for the deliberately de-emphasised state.
              const stroke = isLit
                ? 'stroke-indigo'
                : isMuted
                  ? 'stroke-rule'
                  : 'stroke-faint';

              return (
                <g key={`${edge.from}-${edge.to}-${edge.index}`}>
                  {edge.dashed ? (
                    <motion.path
                      d={edge.d}
                      fill="none"
                      strokeWidth={1}
                      strokeDasharray="4 5"
                      className={cn('transition-colors duration-200', stroke)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: revealed ? 1 : 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.45,
                        delay: shouldReduceMotion ? 0 : 0.15 + edge.index * 0.05,
                      }}
                    />
                  ) : (
                    <motion.path
                      d={edge.d}
                      fill="none"
                      strokeWidth={1}
                      className={cn('transition-colors duration-200', stroke)}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={
                        revealed
                          ? { pathLength: 1, opacity: 1 }
                          : { pathLength: 0, opacity: 0 }
                      }
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.7,
                        delay: shouldReduceMotion ? 0 : 0.15 + edge.index * 0.05,
                        ease: 'easeOut',
                      }}
                    />
                  )}

                  {/* Deliberately a plain <path>, not a motion.path: motion
                      treats pathLength as a special prop and rewrites
                      pathLength/strokeDasharray/strokeDashoffset itself, which
                      would clobber the dash geometry this relies on. The .packet
                      utility in globals.css owns the loop instead — cheaper than
                      dozens of JS-driven repeats, and the global reduced-motion
                      block stops it without any extra work. */}
                  {revealed && !shouldReduceMotion ? (
                    <path
                      d={edge.d}
                      fill="none"
                      pathLength={100}
                      strokeWidth={2}
                      strokeLinecap="round"
                      className={cn(
                        'packet stroke-sodium',
                        isMuted ? 'opacity-20' : 'opacity-90',
                      )}
                      style={{ animationDelay: `${1.1 + edge.index * 0.2}s` }}
                    />
                  ) : null}
                </g>
              );
            })}
          </g>

          <g>
            {diagram.nodes.map((node, index) => {
              const b = box(node);
              const isMuted = Boolean(connected) && !connected?.has(node.id);
              const isActive = node.id === active;

              return (
                <motion.g
                  key={node.id}
                  className="group cursor-default outline-none"
                  tabIndex={0}
                  // role="img" makes aria-label authoritative for the whole box.
                  // Without a role, a label on a bare <g> is unreliably exposed,
                  // and with one the child <text> runs are not read a second time.
                  role="img"
                  aria-label={[node.label, node.sub, node.detail]
                    .filter(Boolean)
                    .join('. ')}
                  onMouseEnter={() => setActive(node.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(node.id)}
                  onBlur={() => setActive(null)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: revealed ? (isMuted ? 0.4 : 1) : 0,
                    y: revealed ? 0 : 8,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.45,
                    delay: shouldReduceMotion ? 0 : 0.1 + index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <rect
                    x={b.x}
                    y={b.y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={2}
                    strokeWidth={1}
                    className={cn(
                      'fill-plate transition-colors duration-200 group-focus-visible:stroke-sodium',
                      isActive ? 'stroke-indigo' : 'stroke-rule-hi',
                    )}
                  />
                  <rect
                    x={b.x}
                    y={b.y}
                    width={3}
                    height={NODE_H}
                    className={KIND[node.kind].bar}
                  />
                  <text
                    x={b.x + NODE_W - 10}
                    y={b.y + 15}
                    textAnchor="end"
                    className="fill-dim font-mono text-[11px]"
                  >
                    {KIND[node.kind].tag}
                  </text>
                  <text
                    x={b.x + 13}
                    y={node.sub ? b.y + 32 : b.y + 36}
                    className="fill-ink font-mono text-[13px]"
                  >
                    {node.label}
                  </text>
                  {node.sub ? (
                    <text
                      x={b.x + 13}
                      y={b.y + 47}
                      className="fill-dim font-mono text-[11px]"
                    >
                      {node.sub}
                    </text>
                  ) : null}
                </motion.g>
              );
            })}
          </g>

          {/* Edge labels paint last so a chip is never clipped by a node box
              drawn over it. Opaque and bordered, so on the occasions where a
              chip overhangs a node edge it reads as a badge sitting above the
              board rather than as a rendering fault. */}
          {revealed ? (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.4,
                delay: shouldReduceMotion ? 0 : 0.75,
              }}
            >
              {edges.map((edge) => {
                if (!edge.label) return null;
                const isLit = connected
                  ? edge.from === active || edge.to === active
                  : false;
                const isMuted = Boolean(connected) && !isLit;
                const chipWidth = edge.label.length * 6.6 + 10;

                return (
                  <g
                    key={`label-${edge.from}-${edge.to}-${edge.index}`}
                    className={cn(
                      'transition-opacity duration-200',
                      isMuted ? 'opacity-40' : 'opacity-100',
                    )}
                  >
                    <rect
                      x={edge.mid.x - chipWidth / 2}
                      y={edge.mid.y - 8}
                      width={chipWidth}
                      height={16}
                      rx={2}
                      strokeWidth={1}
                      className={cn(
                        'fill-void transition-colors duration-200',
                        isLit ? 'stroke-indigo-dim' : 'stroke-rule',
                      )}
                    />
                    <text
                      x={edge.mid.x}
                      y={edge.mid.y + 4}
                      textAnchor="middle"
                      className={cn(
                        'font-mono text-[11px] transition-colors duration-200',
                        isLit ? 'fill-indigo' : 'fill-dim',
                      )}
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}
            </motion.g>
          ) : null}
        </svg>
      </div>

      {/* No aria-live. Hover and focus both write here, so on a keyboard pass
          this would queue one ~100 character announcement per node — all of it
          already spoken by that node's own label. */}
      <p className="mt-3 min-h-[3.25rem] max-w-[70ch] text-[0.8rem] leading-relaxed text-dim">
        {activeNode?.detail ? (
          <>
            <span className="font-mono text-ink">{activeNode.label}</span>{' '}
            {activeNode.detail}
          </>
        ) : (
          diagram.caption
        )}
      </p>

      {/* Topology as prose. The node labels above describe the boxes but not how
          they join up, and edge chips inside an SVG are not read in reading
          order, so without this the flow itself is a purely visual fact. */}
      <p className="sr-only">
        {`Connections in ${diagram.title}: `}
        {edges
          .map((edge) => {
            const from = nodeById.get(edge.from)?.label ?? edge.from;
            const to = nodeById.get(edge.to)?.label ?? edge.to;
            return [
              `${from} to ${to}`,
              edge.label ? ` over ${edge.label}` : '',
              edge.dashed ? ' (planned, not built yet)' : '',
            ].join('');
          })
          .join('; ')}
        .
      </p>
    </div>
  );
}
