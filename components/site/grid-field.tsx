/**
 * Background substrate. A dot field rather than a gradient wash: the page is a
 * console, so the backdrop reads as graph paper the diagrams are drawn on.
 * Purely decorative, so it is hidden from assistive tech.
 */
export function GridField() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="field-dots field-fade absolute inset-0 opacity-70" />
      <div
        className="absolute inset-x-0 top-0 h-[38rem]"
        style={{
          background:
            'radial-gradient(70% 55% at 22% 0%, rgba(124,140,255,0.10), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[26rem]"
        style={{
          background:
            'radial-gradient(45% 40% at 88% 4%, rgba(255,181,71,0.07), transparent 72%)',
        }}
      />
    </div>
  );
}
