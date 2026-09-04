"use client";

import { Clock, Loader2, RefreshCw, TriangleAlert } from "lucide-react";

import {
  type AdminProviderSnapshot,
  type AiUsageProviderId,
  AI_USAGE_PROVIDERS,
  formatUsd,
  snapshotAge,
} from "@/lib/admin/aiUsageAdminApi";
import type { ProviderRefreshOutcome } from "../_hooks/useAiUsageFinancials";

interface ProviderCardsProps {
  providers: AdminProviderSnapshot[];
  loading: boolean;
  refreshing: Partial<Record<AiUsageProviderId, boolean>>;
  refreshOutcome: Partial<Record<AiUsageProviderId, ProviderRefreshOutcome>>;
  onRefresh: (provider: AiUsageProviderId) => void;
}

function usageCells(provider: AdminProviderSnapshot) {
  if (provider.provider === "pollinations") {
    return [
      { label: "Paid pack used", value: formatUsd(provider.paid_used_usd) },
      { label: "Free tier used", value: formatUsd(provider.tier_used_usd) },
    ];
  }
  return [
    { label: "Used", value: formatUsd(provider.total_used_usd) },
    { label: "Funded", value: formatUsd(provider.total_funded_usd) },
  ];
}

function StatusPill({ status }: { status: string }) {
  const ok = status === "ok";
  return (
    <span
      className={[
        "rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
        ok
          ? "bg-primary/12 text-primary"
          : "bg-error-container text-on-error-container",
      ].join(" ")}
    >
      {status || "unknown"}
    </span>
  );
}

/** Provider balance snapshot cards with per-provider refresh (5 min server cooldown). */
export function ProviderCards({
  providers,
  loading,
  refreshing,
  refreshOutcome,
  onRefresh,
}: ProviderCardsProps) {
  if (loading && providers.length === 0) {
    return (
      <section aria-busy className="grid gap-4 md:grid-cols-2">
        {AI_USAGE_PROVIDERS.map((id) => (
          <div
            key={id}
            className="flex h-44 items-center justify-center rounded-2xl border border-outline-variant/15 bg-surface-container-low"
          >
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
        Provider balances
      </h2>
      <div className="mt-2 grid gap-4 md:grid-cols-2">
        {providers.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No provider snapshots available yet.
          </p>
        ) : null}
        {providers.map((provider) => {
          const id = provider.provider as AiUsageProviderId;
          const busy = Boolean(refreshing[id]);
          const outcome = refreshOutcome[id];
          return (
            <article
              key={provider.provider}
              className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold capitalize text-on-surface">
                    {provider.provider}
                  </h3>
                  <StatusPill status={provider.status} />
                </div>
                <button
                  type="button"
                  onClick={() => onRefresh(id)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/25 bg-surface-container px-2.5 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              <p className="mt-3 text-3xl font-black text-on-surface">
                {formatUsd(provider.balance_usd)}
              </p>
              <p className="text-xs text-on-surface-variant">
                Available combined balance
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {usageCells(provider).map((cell) => (
                  <div key={cell.label}>
                    <p className="text-xs text-on-surface-variant">{cell.label}</p>
                    <p className="font-semibold text-on-surface">{cell.value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-xs text-on-surface-variant/80">
                <Clock className="h-3.5 w-3.5" />
                Updated {snapshotAge(provider.fetched_at)}
                {provider.usage_window_days
                  ? ` · usage covers last ${provider.usage_window_days} days`
                  : ""}
              </p>

              {provider.error_code ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-error">
                  <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                  Last fetch failed: {provider.error_code}
                </p>
              ) : null}

              {outcome ? (
                <p
                  className={[
                    "mt-2 flex items-center gap-1.5 text-xs font-medium",
                    outcome.kind === "error"
                      ? "text-error"
                      : outcome.kind === "cooldown"
                        ? "text-on-surface-variant"
                        : "text-primary",
                  ].join(" ")}
                >
                  {outcome.kind === "error" ? (
                    <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {outcome.message}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
