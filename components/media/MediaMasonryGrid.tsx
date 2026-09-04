import type { ReactElement, ReactNode } from "react";

/** Multi-column masonry: fixed column width, natural image height (Pixabay/Stock-style). */
export function MediaMasonryGrid({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): ReactElement {
  return (
    <div
      className={`w-full columns-2 gap-x-3 sm:columns-3 md:columns-4 lg:columns-4 ${className}`.trim()}
      style={{ columnFill: "balance" }}
    >
      {children}
    </div>
  );
}

/**
 * Wrap each masonry cell so it does not split across columns.
 * `inline-block w-full` is required for reliable CSS-columns packing in Chromium.
 */
export function MediaMasonryItem({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): ReactElement {
  return (
    <div
      className={`mb-3 inline-block w-full break-inside-avoid ${className}`.trim()}
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
    >
      {children}
    </div>
  );
}
