import type { ReactElement } from "react";

/** Placeholder while a marketing section chunk loads. */
export function MarketingSectionSkeleton({
  minHeightClassName = "min-h-[16rem]",
}: {
  minHeightClassName?: string;
}): ReactElement {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 py-12 ${minHeightClassName}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-neutral-200/80 dark:bg-neutral-700/60" />
      <div className="mb-3 h-4 w-full max-w-2xl animate-pulse rounded bg-neutral-200/60 dark:bg-neutral-700/40" />
      <div className="h-4 w-full max-w-xl animate-pulse rounded bg-neutral-200/60 dark:bg-neutral-700/40" />
      <span className="sr-only">Loading section…</span>
    </div>
  );
}
