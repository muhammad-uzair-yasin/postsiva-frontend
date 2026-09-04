"use client";

import { Check } from "lucide-react";
import type { ReactElement } from "react";
import { Fragment } from "react";

import {
  formatCompareCell,
  PRICING_COMPARE_ROWS,
  type CompareCell,
} from "@/lib/billing/compareTableData";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

type BillingCompareTableProps = {
  currentPlanId?: string;
};

export function BillingCompareTable({ currentPlanId }: BillingCompareTableProps): ReactElement {
  const { t } = useTranslations();
  const columns = [
    { key: "free" as const, label: t("billing.comparePlanFree") },
    { key: "starter" as const, label: t("billing.comparePlanStarter") },
    { key: "pro" as const, label: t("billing.comparePlanPro") },
  ];
  const unlimitedLabel = t("billing.compareUnlimited");
  const includedLabel = t("billing.compareIncludedAria");

  function Cell({
    value,
    highlight,
  }: {
    value: CompareCell;
    highlight?: boolean;
  }): ReactElement {
    const text = formatCompareCell(value, unlimitedLabel);
    const included = value === true;
    return (
      <td
        className={`px-3 py-2.5 text-center text-sm text-on-surface-variant ${
          highlight ? "bg-primary/5" : ""
        }`}
      >
        {included ? (
          <Check className="mx-auto h-4 w-4 text-secondary" aria-label={includedLabel} />
        ) : (
          <span
            className={value === false ? "text-on-surface-variant/45" : "font-medium text-on-surface"}
          >
            {text}
          </span>
        )}
      </td>
    );
  }

  return (
    <section className="mt-10">
      <h3 className="text-lg font-bold text-on-surface">{t("billing.compareTitle")}</h3>
      <p className="mt-1 text-sm text-on-surface-variant">{t("billing.compareSubtitle")}</p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-outline-variant/15 bg-surface-container-low">
        <table className="min-w-[720px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant/15 bg-surface-container">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t("billing.compareFeatureColumn")}
              </th>
              {columns.map((col) => {
                const isCurrent = currentPlanId === col.key;
                return (
                  <th
                    key={col.key}
                    className={`px-3 py-3 text-center text-xs font-bold uppercase tracking-wider ${
                      isCurrent ? "bg-primary/10 text-primary" : "text-on-surface"
                    }`}
                  >
                    {col.label}
                    {isCurrent ? (
                      <span className="mt-0.5 block text-[9px] font-semibold normal-case tracking-normal">
                        {t("billing.compareCurrentBadge")}
                      </span>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PRICING_COMPARE_ROWS.map((row, i) => (
              <Fragment key={`${row.labelKey}-${i}`}>
                {row.sectionKey ? (
                  <tr className="border-b border-outline-variant/10">
                    <td
                      colSpan={4}
                      className="bg-surface-container/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
                    >
                      {t(`billing.${row.sectionKey}`)}
                    </td>
                  </tr>
                ) : null}
                <tr className="border-b border-outline-variant/10 last:border-0">
                  <td className="px-4 py-2.5 text-sm font-medium text-on-surface">
                    {t(`billing.${row.labelKey}`)}
                  </td>
                  {columns.map((col) => (
                    <Cell
                      key={col.key}
                      value={row[col.key]}
                      highlight={currentPlanId === col.key}
                    />
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
