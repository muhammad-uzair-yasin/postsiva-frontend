"use client";

import { CalendarClock, Coins, Gauge } from "lucide-react";
import type { ReactElement } from "react";

import type { AiUsageSummary } from "@/lib/aiUsage/types";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export function AiUsageCredits({ summary }: { summary: AiUsageSummary }): ReactElement {
  const { t } = useTranslations();
  const { credits } = summary;
  const percent = credits.limit ? Math.min(100, (credits.used / credits.limit) * 100) : 0;
  const cards = [
    { label: t("settings.aiUsageCreditsRemaining"), value: credits.remaining, icon: Coins },
    { label: t("settings.aiUsageCreditsUsed"), value: credits.used, icon: Gauge },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
            <Icon className="mb-3 h-5 w-5 text-primary" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-on-surface">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-bold text-on-surface">{t("settings.aiUsageCreditProgress")}</span>
          <span className="tabular-nums text-on-surface-variant">{credits.used.toLocaleString()} / {credits.limit.toLocaleString()}</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
          <CalendarClock className="h-4 w-4" aria-hidden />
          {t("settings.aiUsageResets", { date: formatDate(summary.period.end) })}
        </p>
      </div>
    </div>
  );
}
