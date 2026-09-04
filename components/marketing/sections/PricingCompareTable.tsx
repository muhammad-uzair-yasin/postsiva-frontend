"use client";

import { Check } from "lucide-react";
import type { ReactElement } from "react";
import { Fragment } from "react";

import {
  formatCompareCell,
  PRICING_COMPARE_ROWS,
  type CompareCell,
} from "@/lib/billing/compareTableData";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

export function PricingCompareTable(): ReactElement {
  const { t } = usePublicTranslations();

  const columns = [
    { key: "free" as const, label: t("marketing.compareColumnFree") },
    { key: "starter" as const, label: t("marketing.compareColumnStarter") },
    { key: "pro" as const, label: t("marketing.compareColumnPro") },
  ];

  const includedLabel = t("marketing.compareCellIncluded");
  const unlimitedLabel = t("marketing.compareUnlimited");

  function Cell({ value }: { value: CompareCell }): ReactElement {
    const text = formatCompareCell(value, unlimitedLabel);
    const included = value === true;
    return (
      <td className="px-3 py-3 text-center text-sm text-on-surface-variant">
        {included ? (
          <Check className="mx-auto h-4 w-4 text-secondary" aria-label={includedLabel} />
        ) : (
          <span
            className={
              value === false ? "text-on-surface-variant/50" : "font-medium text-on-surface"
            }
          >
            {text}
          </span>
        )}
      </td>
    );
  }

  return (
    <section className="relative py-16">
      <div className="marketing-container">
        <h2 className="text-center text-2xl font-black text-on-surface sm:text-3xl">
          {t("marketing.compareTableTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-on-surface-variant">
          {t("marketing.compareTableSubtitle")}
        </p>
        <div className="app-hscroll mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-surface-container/60">
          <table className="min-w-[720px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-surface-container-high/50">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-on-surface-variant">
                  {t("marketing.compareColumnFeature")}
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-4 text-center text-xs font-black uppercase tracking-wider text-on-surface"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRICING_COMPARE_ROWS.map((row, i) => (
                <Fragment key={`${row.labelKey}-${i}`}>
                  {row.sectionKey ? (
                    <tr className="border-b border-white/5">
                      <td
                        colSpan={4}
                        className="bg-surface-container-low/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary"
                      >
                        {t(`marketing.${row.sectionKey}`)}
                      </td>
                    </tr>
                  ) : null}
                  <tr className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">
                      {t(`marketing.${row.labelKey}`)}
                    </td>
                    <Cell value={row.free} />
                    <Cell value={row.starter} />
                    <Cell value={row.pro} />
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
