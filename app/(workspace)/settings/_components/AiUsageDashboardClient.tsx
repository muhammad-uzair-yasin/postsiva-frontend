"use client";

import { RefreshCw } from "lucide-react";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useAiUsage } from "../_hooks/useAiUsage";
import { AiUsageBreakdowns } from "./AiUsageBreakdowns";
import { AiUsageCredits } from "./AiUsageCredits";
import { AiUsageEventList } from "./AiUsageEventList";
import { AiUsageMixChart } from "./AiUsageMixChart";
import { UnifiedContentUsage } from "./UnifiedContentUsage";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

export function AiUsageDashboardClient({
  workspaceIdOverride,
}: {
  /** Account-level owner scope; omit to use the active workspace. */
  workspaceIdOverride?: string | null;
} = {}): ReactElement {
  const { t } = useTranslations();
  const usage = useAiUsage(workspaceIdOverride);

  return (
    <SettingsSectionPanel title={t("settings.aiUsage")}>
      <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
        {t("settings.aiUsageIntro")}
      </p>
      {usage.loading && !usage.summary ? (
        <div className="grid animate-pulse gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-28 rounded-2xl bg-surface-container-high" />)}
        </div>
      ) : null}
      {usage.error ? (
        <div className="rounded-2xl border border-error/20 bg-error/5 p-5">
          <p className="text-sm text-error">{t("settings.aiUsageLoadError")}</p>
          <button type="button" onClick={() => void usage.load()} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary">
            <RefreshCw className="h-4 w-4" aria-hidden /> {t("common.retry")}
          </button>
        </div>
      ) : null}
      {usage.summary ? (
        <>
          <AiUsageCredits summary={usage.summary} />
          <UnifiedContentUsage summary={usage.summary} />
          <AiUsageMixChart daily={usage.summary.breakdown.daily} />
          <AiUsageBreakdowns breakdown={usage.summary.breakdown} />
          <AiUsageEventList
            events={usage.events}
            filters={usage.filters}
            breakdown={usage.summary.breakdown}
            loading={usage.loading}
            onFiltersChange={usage.setFilters}
            onLoadMore={() => void usage.loadMore()}
          />
        </>
      ) : null}
    </SettingsSectionPanel>
  );
}
