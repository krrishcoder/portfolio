/**
 * Minimal class-name joiner. Deliberately dependency-free: this project avoids
 * clsx/tailwind-merge so it installs cleanly against Tailwind v4 with no extras.
 * Later classes win only if they do not collide on the same Tailwind property,
 * so write conflicting variants conditionally rather than relying on a merger.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
