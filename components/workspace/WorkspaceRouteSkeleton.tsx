import type { ReactElement } from "react";

type WorkspaceRouteSkeletonProps = {
  /** Visible hint for sighted users; also used as sr-only when preferSrOnlyLabel. */
  label?: string;
  /** denser grid for list-like pages */
  variant?: "grid" | "feed" | "calendar" | "form";
};

/**
 * Shared chrome while a workspace screen chunk loads via next/dynamic.
 * No data fetching — FE shell only.
 */
export function WorkspaceRouteSkeleton({
  label = "Loading…",
  variant = "grid",
}: WorkspaceRouteSkeletonProps): ReactElement {
  return (
    <div
      className="flex min-h-[min(50vh,24rem)] w-full flex-1 flex-col gap-4 p-4 md:p-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-surface-container-high md:w-52" />
        <div className="h-8 w-24 animate-pulse rounded-lg bg-surface-container-high" />
      </div>
      {variant === "calendar" ? (
        <div className="grid min-h-[20rem] flex-1 grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-surface-container-high"
            />
          ))}
        </div>
      ) : variant === "feed" ? (
        <div className="flex flex-1 flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-surface-container-high"
            />
          ))}
        </div>
      ) : variant === "form" ? (
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 pt-8">
          <div className="h-10 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-10 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-10 w-1/2 animate-pulse rounded-lg bg-surface-container-high" />
        </div>
      ) : (
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl bg-surface-container-high"
            />
          ))}
        </div>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
