# Krishna Kumar — portfolio

A single-page portfolio built as a control plane for the systems I've shipped: a status
bar with live scroll progress, a deployment log instead of a work history, a service
catalog whose rows expand into full detail panels, and five interactive architecture
diagrams drawn from the real topologies.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build         # production build
npm run typecheck     # tsc --noEmit
```

Node 18.18+ (Next 15 requires it). There is nothing to configure — no environment
variables, no API routes, no analytics or tracking of any kind.

## Layout

`app/` holds the root layout, the single page, and `globals.css`. `components/site/`
holds the page's own sections. `components/motion-primitives/` holds the
[motion-primitives](https://motion-primitives.com) components, vendored rather than
installed, because that library is distributed as copy-paste source. `lib/data.ts` is
every fact on the page in one place; `lib/diagrams.ts` is the node/edge data for the
architecture boards.

## Decisions worth knowing before you edit

**Tailwind v4, CSS-first.** There is no `tailwind.config.ts`. Design tokens live in an
`@theme` block at the top of `app/globals.css`, and that file is the single source of
truth for the palette. Note that v4 renamed the gradient utilities: `bg-gradient-to-r`
is now `bg-linear-to-r`, and the old spelling emits no CSS at all rather than erroring.

**Motion imports come from `motion/react`, never `framer-motion`.** Same library, new
package name.

**Reduced motion is gated twice.** `globals.css` clamps CSS animations and transitions
under `prefers-reduced-motion`, but it cannot touch the inline styles Motion writes, so
every JS-driven stagger also reads `useReducedMotion()` from `lib/use-reduced-motion.ts`
and zeroes its own duration and delay. That wrapper exists because Motion's own hook
returns `null` during server rendering and the real boolean on the client's first
render, which hydration treats as a mismatch.

**`cn()` in `lib/cn.ts` is a plain join, not tailwind-merge.** Conflicting utilities are
resolved by CSS emission order, not by last-wins, so passing `text-sm` to a component
whose base classes already set a size may or may not do what you expect. Check the
primitive before assuming.

**Diagram edge labels are capped at 12 characters.** The board grid leaves a 42px gap
between columns, and a longer chip starts overhanging the node boxes on either side.
The budget is documented on the `DiagramEdge` type.

## verify.py

```bash
python3 verify.py
```

A structural check that stands in for a compiler. It resolves every relative and `@/`
import against the actual export list of its target (including through the barrel file),
checks bracket balance with strings and comments stripped, asserts that any file touching
client-only APIs opens with `'use client'`, and verifies that every Tailwind colour,
font, and text utility refers to a token that actually exists in `globals.css` — which is
what catches the silent-failure cases the type checker can't see, like a misspelled token
or a v3 gradient name. It also confirms the status-bar nav points only at section ids that
something renders, and that every `diagramId` in `data.ts` exists in `diagrams.ts`.

It is not a substitute for `npm run build`; run both.

## Accessibility notes

Motion is heavy by design but every animation has a reduced-motion path. Diagram nodes
carry `role="img"` with a full label, and because WebKit will not place SVG `tabindex`
elements in the tab order, the scroll container itself is focusable and the topology is
additionally written out as prose for screen readers. Status is never encoded in colour
alone. Body text and small monospace clear 4.5:1 against every surface they sit on;
structural hairlines (`--color-rule`) deliberately sit below the 3:1 non-text bar,
because a 3:1 hairline everywhere turns a quiet console into a wireframe grid.
