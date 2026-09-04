"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactElement } from "react";

import type { AiUsageEventFilters, AiUsageEventsPage, AiUsageSummary } from "@/lib/aiUsage/types";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

function label(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

interface Props {
  events: AiUsageEventsPage;
  filters: AiUsageEventFilters;
  breakdown: AiUsageSummary["breakdown"];
  loading: boolean;
  onFiltersChange: (filters: AiUsageEventFilters) => void;
  onLoadMore: () => void;
}

export function AiUsageEventList(props: Props): ReactElement {
  const { t } = useTranslations();
  const [expanded, setExpanded] = useState<string | null>(null);
  const { events, filters, breakdown } = props;
  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="font-bold text-on-surface">{t("settings.aiUsageDetails")}</h3><p className="text-xs text-on-surface-variant">{t("settings.aiUsageDetailsHint")}</p></div>
        <div className="flex flex-wrap gap-2">
          <select aria-label={t("settings.aiUsageFilterOperation")} value={filters.operation ?? ""} onChange={(event) => props.onFiltersChange({ ...filters, operation: event.target.value || undefined })} className="rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-xs text-on-surface">
            <option value="">{t("settings.aiUsageAllOperations")}</option>
            {breakdown.by_operation.map((row) => <option key={row.key} value={row.key}>{row.label || label(row.key)}</option>)}
          </select>
          <select aria-label={t("settings.aiUsageFilterChannel")} value={filters.channel ?? ""} onChange={(event) => props.onFiltersChange({ ...filters, channel: event.target.value || undefined })} className="rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-xs text-on-surface">
            <option value="">{t("settings.aiUsageAllChannels")}</option>
            {breakdown.by_channel.map((row) => <option key={row.key} value={row.key}>{row.label || label(row.key)}</option>)}
          </select>
        </div>
      </div>
      <div className="custom-scrollbar max-h-[min(34rem,58vh)] overflow-y-auto overscroll-contain pr-2">
        {events.items.length ? (
          <ul className="divide-y divide-outline-variant/15">
            {events.items.map((item) => {
              const open = expanded === item.id;
              return <li key={item.id} className="py-2"><button type="button" onClick={() => setExpanded(open ? null : item.id)} className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left hover:bg-surface-container-high">
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-on-surface">{label(item.operation_type)}</span><span className="block text-xs text-on-surface-variant">{new Date(item.created_at).toLocaleString()}</span></span>
                <span className="text-sm font-bold tabular-nums text-on-surface">{t("settings.aiUsageCreditCount", { count: item.credits })}</span>
              </button>{open ? <dl className="ml-8 grid gap-2 rounded-xl bg-surface-container-high p-4 text-xs sm:grid-cols-3">
                <div><dt className="text-on-surface-variant">{t("settings.aiUsageChannel")}</dt><dd className="font-medium text-on-surface">{label(item.channel)}</dd></div>
                <div><dt className="text-on-surface-variant">{t("settings.aiUsageWorkspace")}</dt><dd className="font-medium text-on-surface">{item.workspace_name || t("settings.aiUsageUnknownWorkspace")}</dd></div>
                <div><dt className="text-on-surface-variant">{t("settings.aiUsageStatus")}</dt><dd className="font-medium text-on-surface">{label(item.status)}</dd></div>
                {item.steps.length ? <div className="sm:col-span-3"><dt className="text-on-surface-variant">AI steps</dt><dd className="mt-1 flex flex-wrap gap-1.5">{item.steps.map((step, index) => <span key={`${step.route_key}-${index}`} className="rounded-full bg-surface-container px-2 py-1 font-medium text-on-surface">{label(step.route_key)} · {label(step.status)}</span>)}</dd></div> : null}
              </dl> : null}</li>;
            })}
          </ul>
        ) : <p className="py-6 text-center text-sm text-on-surface-variant">{t("settings.aiUsageNoActivity")}</p>}
        {events.next_cursor ? <button type="button" disabled={props.loading} onClick={props.onLoadMore} className="mt-4 rounded-xl border border-primary/30 px-4 py-2 text-sm font-bold text-primary disabled:opacity-50">{t("settings.aiUsageLoadMore")}</button> : null}
      </div>
    </section>
  );
}
