"use client";

import { CreditCard, Loader2, XCircle } from "lucide-react";
import type { ReactElement } from "react";

import type { BillingInterval, BillingPlanPublic, PaidPlanId } from "@/lib/billing/billingApi";
import { comparePlanTier, isPaidPlan, planPriceLabel } from "@/lib/billing/planCardCopy";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { BillingPlanDetailsBlock } from "./BillingPlanDetailsBlock";

type BillingUpgradePlanCardProps = {
  plan: BillingPlanPublic;
  interval: BillingInterval;
  currentPlanId: string;
  checkoutBusy: PaidPlanId | null;
  changeBusy: PaidPlanId | null;
  cancelBusy: boolean;
  onCheckout: (planId: PaidPlanId) => void;
  onChangePlan: (planId: PaidPlanId) => void;
  onCancelSubscription: () => void;
};

export function BillingUpgradePlanCard({
  plan,
  interval,
  currentPlanId,
  checkoutBusy,
  changeBusy,
  cancelBusy,
  onCheckout,
  onChangePlan,
  onCancelSubscription,
}: BillingUpgradePlanCardProps): ReactElement {
  const { t } = useTranslations();
  const price = planPriceLabel(plan, interval);
  const paid = isPaidPlan(plan.plan_id);
  const planId = plan.plan_id as PaidPlanId;
  const isCurrent = currentPlanId === plan.plan_id;
  const tierDelta = comparePlanTier(currentPlanId, plan.plan_id);
  const isUpgrade = tierDelta > 0;
  const isDowngrade = tierDelta < 0 && paid;
  const isPaidToPaidChange =
    isPaidPlan(currentPlanId) && paid && !isCurrent && (isUpgrade || isDowngrade);

  let actionLabel = t("billing.upgradeTo", { plan: plan.display_name });
  if (isCurrent) {
    actionLabel = t("billing.currentPlan");
  } else if (isDowngrade) {
    actionLabel = t("billing.switchTo", { plan: plan.display_name });
  } else if (isPaidToPaidChange && isUpgrade) {
    actionLabel = t("billing.upgradeTo", { plan: plan.display_name });
  }

  const busy = checkoutBusy === planId || changeBusy === planId;
  const showCancel = isCurrent && paid && isPaidPlan(currentPlanId);

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-5 ${
        isCurrent
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
          : "border-outline-variant/15 bg-surface-container-low"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-black text-on-surface">{plan.display_name}</p>
        {isCurrent ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-on-primary">
            {t("billing.current")}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-2xl font-black text-on-surface">{price.main}</p>
      <p className="text-xs text-on-surface-variant">{price.sub}</p>
      <p className="mt-2 text-sm text-on-surface-variant">{plan.tagline}</p>

      <div className="flex-1">
        <BillingPlanDetailsBlock plan={plan} />
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-2 pt-4">
        {paid ? (
          <>
            <button
              type="button"
              disabled={isCurrent || checkoutBusy !== null || changeBusy !== null || cancelBusy}
              onClick={() => {
                if (isPaidToPaidChange || isDowngrade) {
                  onChangePlan(planId);
                  return;
                }
                onCheckout(planId);
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {busy ? t("billing.processing") : actionLabel}
            </button>
            {showCancel ? (
              <button
                type="button"
                disabled={checkoutBusy !== null || changeBusy !== null || cancelBusy}
                onClick={onCancelSubscription}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant/30 px-4 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
              >
                {cancelBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {cancelBusy ? t("billing.canceling") : t("billing.cancelConfirm")}
              </button>
            ) : (
              <div className="h-10 shrink-0" aria-hidden />
            )}
          </>
        ) : (
          <>
            <p className="flex h-10 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container px-4 text-center text-sm font-semibold text-on-surface-variant">
              {isCurrent
                ? t("billing.currentPlan")
                : isUpgrade
                  ? t("billing.includedWhenCancel")
                  : t("billing.freeTier")}
            </p>
            {isPaidPlan(currentPlanId) ? <div className="h-10 shrink-0" aria-hidden /> : null}
          </>
        )}
      </div>
    </div>
  );
}
