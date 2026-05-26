/**
 * Page transition wrapper.
 *
 * Temporarily disabled: the previous implementation started an empty
 * transition after navigation had already committed, adding work without
 * improving perceived route changes.
 */
export function ViewTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
