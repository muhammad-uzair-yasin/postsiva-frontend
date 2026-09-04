"use client";

import { Check, X } from "lucide-react";
import type { ReactElement } from "react";

import type { BillingPlanPublic } from "@/lib/billing/billingApi";
import { formatPlanLimitRows, planFeatureRows } from "@/lib/billing/planDetailLabels";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

type PlanDetailsBlockProps = {
  plan: BillingPlanPublic;
  /** Marketing cards use lighter borders on dark glass backgrounds. */
  variant?: "settings" | "marketing";
};

export function PlanDetailsBlock({
  plan,
  variant = "settings",
}: PlanDetailsBlockProps): ReactElement {
  const { t } = useTranslations();
  const limits = formatPlanLimitRows(plan.limits);
  const features = planFeatureRows(plan);
  const included = features.filter((f) => f.included);
  const excluded = features.filter((f) => !f.included);

  const borderClass =
    variant === "marketing"
      ? "border-t border-white/10 pt-4"
      : "border-t border-outline-variant/15 pt-4";

  return (
    <div className={`mt-4 space-y-4 ${borderClass}`}>
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          {t("billing.planDetailsMonthlyLimits")}
        </p>
        <ul className="space-y-1">
          {limits.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-on-surface-variant">{row.label}</span>
              <span className="shrink-0 font-semibold text-on-surface">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          {t("billing.planDetailsIncluded")}
        </p>
        <ul className="space-y-1">
          {included.map((row) => (
            <li key={row.key} className="flex items-start gap-2 text-xs text-on-surface">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden />
              <span>{row.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {excluded.length > 0 ? (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            {t("billing.planDetailsNotIncluded")}
          </p>
          <ul className="space-y-1">
            {excluded.map((row) => (
              <li key={row.key} className="flex items-start gap-2 text-xs text-on-surface-variant">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
                <span>{row.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
