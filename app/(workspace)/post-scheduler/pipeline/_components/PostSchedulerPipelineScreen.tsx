"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { WorkspacePageScaffold } from "../../../_components/WorkspacePageScaffold";

const STEP_KEYS = [
  { id: "idea", labelKey: "postScheduler.pipeline.idea", descKey: "postScheduler.pipeline.ideaDesc" },
  { id: "draft", labelKey: "postScheduler.pipeline.draft", descKey: "postScheduler.pipeline.draftDesc" },
  { id: "review", labelKey: "postScheduler.pipeline.review", descKey: "postScheduler.pipeline.reviewDesc" },
  { id: "scheduled", labelKey: "postScheduler.pipeline.scheduled", descKey: "postScheduler.pipeline.scheduledDesc" },
] as const;

export function PostSchedulerPipelineScreen(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <WorkspacePageScaffold>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/post-scheduler"
            className="text-sm font-bold text-on-surface-variant hover:text-secondary"
          >
            {t("postScheduler.pipeline.back")}
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            {t("postScheduler.pipeline.title")}{" "}
            <span className="text-secondary">{t("postScheduler.pipeline.titleAccent")}</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
            {t("postScheduler.pipeline.subtitle")}
          </p>
        </div>
      </div>
      <div className="mb-10 flex flex-wrap gap-2">
        {STEP_KEYS.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container px-4 py-2 text-xs font-bold text-on-surface"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container text-[10px] text-on-secondary-container">
              {i + 1}
            </span>
            {t(s.labelKey)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {STEP_KEYS.map((s) => (
          <article
            key={s.id}
            className="rounded-2xl border border-outline-variant/10 bg-surface-container p-5 shadow-lg"
          >
            <h2 className="text-lg font-bold text-on-surface">{t(s.labelKey)}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t(s.descKey)}</p>
            <ul className="mt-4 space-y-2 text-sm text-on-surface">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg">
                  drag_indicator
                </span>
                {t("postScheduler.pipeline.sampleCard", { label: t(s.labelKey) })}
              </li>
              <li className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">
                  add_circle
                </span>
                {t("postScheduler.pipeline.addItem")}
              </li>
            </ul>
          </article>
        ))}
      </div>
    </WorkspacePageScaffold>
  );
}
