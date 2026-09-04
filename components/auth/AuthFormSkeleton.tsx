import type { ReactElement } from "react";

/** Auth form chrome while login/signup (etc.) chunk loads. */
export function AuthFormSkeleton(): ReactElement {
  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 py-16"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto h-10 w-40 animate-pulse rounded-lg bg-on-surface-variant/15" />
      <div className="mt-4 h-11 animate-pulse rounded-lg bg-on-surface-variant/15" />
      <div className="h-11 animate-pulse rounded-lg bg-on-surface-variant/15" />
      <div className="h-11 w-full animate-pulse rounded-lg bg-on-surface-variant/20" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
