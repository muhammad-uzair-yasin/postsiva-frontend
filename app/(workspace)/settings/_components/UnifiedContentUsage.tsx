"use client";

import { CalendarClock, FileText, MessageSquare, Send } from "lucide-react";
import type { ReactElement } from "react";

import type { AiUsageSummary } from "@/lib/aiUsage/types";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

function quota(value: number, limit: number): string {
  return limit >= 1_000_000_000
    ? `${value.toLocaleString()} / ∞`
    : `${value.toLocaleString()} / ${limit.toLocaleString()}`;
}

export function UnifiedContentUsage({ summary }: { summary: AiUsageSummary }): ReactElement | null {
  const { t } = useTranslations();
  const resources = summary.resource_usage;
  const activity = summary.workspace_activity;
  if (!resources && !activity) return null;

  const cards = [
    {
      label: t("settings.usagePublishedPosts"),
      value: resources ? quota(resources.published_posts.used, resources.published_posts.limit) : "—",
      hint: t("settings.usageBillingPeriod"),
      icon: Send,
    },
    {
      label: t("settings.usageScheduledPosts"),
      value: resources ? quota(resources.scheduled_posts.used, resources.scheduled_posts.limit) : "—",
      hint: t("settings.usageBillingPeriod"),
      icon: CalendarClock,
    },
    {
      label: t("settings.usageSavedDrafts"),
      value: (activity?.draft_saved_count ?? 0).toLocaleString(),
      hint: t("settings.usageCurrentWorkspace"),
      icon: FileText,
    },
    {
      label: t("settings.usageCommentsPosted"),
      value: (activity?.comments_posted_count ?? 0).toLocaleString(),
      hint: t("settings.usageCurrentWorkspace"),
      icon: MessageSquare,
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="font-bold text-on-surface">{t("settings.usageContentActivity")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
            <Icon className="mb-3 h-5 w-5 text-primary" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-on-surface">{value}</p>
            <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
