"use client";

import type { ReactElement, ReactNode } from "react";

import { WorkspaceNavUserProfile } from "../../_components/WorkspaceNavUserProfile";

type OnboardingShellProps = {
  readonly children: ReactNode;
  readonly step?: 1 | 2;
  /** Wider content column for grid-heavy steps (e.g. connect accounts). */
  readonly wide?: boolean;
};

export function OnboardingShell({
  children,
  step,
  wide = false,
}: OnboardingShellProps): ReactElement {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-outline-variant/15 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-headline text-lg font-bold tracking-tight text-on-surface">
            Postsiva
          </span>
          {step ? (
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
              {step} / 2
            </span>
          ) : null}
        </div>
        <WorkspaceNavUserProfile variant="dashboard" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className={wide ? "w-full max-w-6xl xl:max-w-7xl" : "w-full max-w-3xl"}>
          {children}
        </div>
      </main>
    </div>
  );
}
