"use client";

import { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { useAiUsageFinancials } from "../_hooks/useAiUsageFinancials";
import { useOperationDetail, useReconciliation } from "../_hooks/useAiUsageDetails";
import { CustomersTable } from "./CustomersTable";
import { FinancialTotals } from "./FinancialTotals";
import { OperationDetailPanel } from "./OperationDetailPanel";
import { ProviderCards } from "./ProviderCards";
import { ReconciliationPanel } from "./ReconciliationPanel";

type TabId = "financials" | "reconciliation";

const TABS: { id: TabId; label: string }[] = [
  { id: "financials", label: "Financials" },
  { id: "reconciliation", label: "Reconciliation" },
];

/** Admin AI usage financial control view (spec 037 T15). */
export function AiUsageScreen() {
  const [tab, setTab] = useState<TabId>("financials");
  const financials = useAiUsageFinancials();
  const operation = useOperationDetail();
  const reconciliation = useReconciliation(tab === "reconciliation");

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface">AI Usage &amp; Cost</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Provider balances, Paddle earnings and customer contribution after AI cost
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void financials.reload();
            if (tab === "reconciliation") void reconciliation.reload();
          }}
          disabled={financials.loading}
          className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${financials.loading ? "animate-spin" : ""}`}
          />
          Reload
        </button>
      </div>

      <div className="mt-4 flex gap-1 rounded-xl bg-surface-container-low p-1 sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "flex-1 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors sm:flex-none",
              tab === t.id
                ? "bg-surface-container-highest text-on-surface"
                : "text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {financials.error ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{financials.error}</span>
          <button
            type="button"
            onClick={() => void financials.reload()}
            className="ml-auto shrink-0 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : null}

      {tab === "financials" ? (
        <div className="mt-5 space-y-6">
          <ProviderCards
            providers={financials.overview?.providers ?? []}
            loading={financials.loading}
            refreshing={financials.refreshing}
            refreshOutcome={financials.refreshOutcome}
            onRefresh={(provider) => void financials.refreshProvider(provider)}
          />
          <FinancialTotals
            totals={financials.overview?.totals ?? null}
            loading={financials.loading}
          />
          <CustomersTable
            customers={financials.customers}
            loading={financials.loading}
            onOpenOperation={operation.openOperation}
          />
        </div>
      ) : (
        <div className="mt-5">
          <ReconciliationPanel
            report={reconciliation.report}
            loading={reconciliation.loading}
            error={reconciliation.error}
            onReload={() => void reconciliation.reload()}
            onOpenOperation={operation.openOperation}
          />
        </div>
      )}

      {operation.operationId ? (
        <OperationDetailPanel
          operationId={operation.operationId}
          detail={operation.detail}
          loading={operation.loading}
          error={operation.error}
          onClose={operation.close}
        />
      ) : null}
    </div>
  );
}
