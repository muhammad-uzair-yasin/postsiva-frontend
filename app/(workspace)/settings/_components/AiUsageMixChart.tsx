"use client";

import { BarChart3 } from "lucide-react";
import type { ReactElement } from "react";

import type { AiUsageDailyRow } from "@/lib/aiUsage/types";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function AiUsageMixChart({ daily }: { daily: AiUsageDailyRow[] }): ReactElement {
  const { t } = useTranslations();
  const rows = daily.slice(-14);
  const max = Math.max(...rows.map((row) => row.credits), 1);
  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
        <h3 className="font-bold text-on-surface">{t("settings.aiUsageDailyTitle")}</h3>
      </div>
      {rows.length ? (
        <div className="flex h-44 items-end gap-2" aria-label={t("settings.aiUsageDailyTitle")}>
          {rows.map((row) => (
            <div key={row.date} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="invisible text-[10px] font-bold tabular-nums text-on-surface group-hover:visible">{row.credits}</span>
              <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max(4, (row.credits / max) * 120)}px` }} title={`${row.date}: ${row.credits}`} />
              <span className="truncate text-[9px] text-on-surface-variant">{row.date.slice(5)}</span>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-on-surface-variant">{t("settings.aiUsageNoActivity")}</p>}
    </section>
  );
}
