"use client";

import type { ReactElement } from "react";

import type { AiUsageSummary } from "@/lib/aiUsage/types";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

type Breakdown = AiUsageSummary["breakdown"];

function friendlyKey(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function BreakdownCard({ title, rows }: { title: string; rows: Array<{ key: string; label?: string | null; credits: number; count: number }> }): ReactElement {
  const { t } = useTranslations();
  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
      <h3 className="mb-4 font-bold text-on-surface">{title}</h3>
      {rows.length ? (
        <ul className="divide-y divide-outline-variant/15">
          {rows.slice(0, 8).map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div><p className="font-medium text-on-surface">{row.label || friendlyKey(row.key)}</p><p className="text-xs text-on-surface-variant">{t("settings.aiUsageActions", { count: row.count })}</p></div>
              <span className="font-bold tabular-nums text-on-surface">{t("settings.aiUsageCreditCount", { count: row.credits })}</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-on-surface-variant">{t("settings.aiUsageNoActivity")}</p>}
    </section>
  );
}

export function AiUsageBreakdowns({ breakdown }: { breakdown: Breakdown }): ReactElement {
  const { t } = useTranslations();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BreakdownCard title={t("settings.aiUsageByOperation")} rows={breakdown.by_operation} />
      <BreakdownCard title={t("settings.aiUsageByChannel")} rows={breakdown.by_channel} />
    </div>
  );
}
