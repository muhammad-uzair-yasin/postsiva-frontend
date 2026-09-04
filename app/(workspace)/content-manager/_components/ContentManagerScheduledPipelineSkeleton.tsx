"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const ROWS = 3;

export function ContentManagerScheduledPipelineSkeleton(): ReactElement {
  const { t } = useTranslations();

  return (
    <div
      className="relative space-y-12 before:absolute before:bottom-4 before:left-6 before:top-4 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-secondary/40 before:to-transparent"
      aria-busy
      aria-label={t("content.scheduledLoadingAria")}
    >
      {Array.from({ length: ROWS }, (_, i) => (
        <article key={`sk-${i}`} className="relative pl-14">
          <div className="absolute left-5 top-8 h-2 w-2 rounded-full bg-outline-variant/30" />
          <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-low/60">
            <div className="flex flex-col md:flex-row">
              <div className="h-48 w-full animate-pulse bg-surface-container md:w-64" />
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="h-4 w-40 animate-pulse rounded bg-surface-container" />
                <div className="h-3 w-28 animate-pulse rounded bg-surface-container" />
                <div className="h-3 w-full animate-pulse rounded bg-surface-container" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-surface-container" />
                <div className="mt-2 flex justify-between">
                  <div className="h-8 w-20 animate-pulse rounded bg-surface-container" />
                  <div className="h-8 w-24 animate-pulse rounded-full bg-primary/10" />
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
