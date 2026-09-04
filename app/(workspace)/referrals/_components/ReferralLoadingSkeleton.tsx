"use client";

import type { ReactElement } from "react";

function Bone({ className }: { className: string }): ReactElement {
  return <div className={`inbox-skeleton-shimmer rounded-lg ${className}`} />;
}

/**
 * Shimmer placeholder matching Refer & Earn layout. Scaffold-free so it renders
 * inside the `(account)` shell (no workspace-only providers).
 */
export function ReferralLoadingSkeleton(): ReactElement {
  return (
      <div
        className="flex w-full flex-col gap-10 pb-16"
        aria-busy="true"
        aria-label="Loading Refer & Earn"
      >
        <Bone className="h-8 w-40" />

        <section className="flex flex-col items-center gap-5">
          <Bone className="h-10 w-52 sm:w-64" />
          <Bone className="h-4 w-full max-w-md" />
          <Bone className="h-4 w-3/4 max-w-sm" />

          <div className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-5">
            <Bone className="mb-3 h-5 w-36" />
            <Bone className="mb-2 h-6 w-full max-w-lg" />
            <Bone className="mb-2 h-4 w-full" />
            <Bone className="h-4 w-2/3" />
            <Bone className="mt-4 h-4 w-48" />
          </div>

          <div className="w-full rounded-2xl bg-surface-container-low px-4 py-5">
            <Bone className="mx-auto mb-3 h-3 w-56" />
            <div className="flex gap-2">
              <Bone className="h-11 flex-1" />
              <Bone className="h-11 w-20 shrink-0" />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {Array.from({ length: 11 }).map((_, i) => (
                <Bone key={i} className="h-11 w-11 !rounded-full" />
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-outline-variant/20 px-4 py-4"
            >
              <Bone className="mb-2 h-3 w-16" />
              <Bone className="h-7 w-12" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Bone className="h-12" />
          <Bone className="h-12" />
        </div>
        <Bone className="h-48 w-full rounded-xl" />
      </div>
  );
}
