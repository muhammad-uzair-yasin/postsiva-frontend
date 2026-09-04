"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";

import {
  cancelBillingSubscription,
  changeBillingPlan,
  fetchBillingPlans,
  startBillingCheckout,
  type BillingInterval,
  type BillingPlanPublic,
  type PaidPlanId,
} from "@/lib/billing/billingApi";
import {
  BILLING_EXPECTED_PLAN_KEY,
  BILLING_PREVIOUS_PLAN_KEY,
  BILLING_TRANSACTION_KEY,
  comparePlanTier,
  isPaidPlan,
  planDisplayName,
} from "@/lib/billing/planCardCopy";
import {
  clearCheckoutTransactionId,
  isBillingCheckoutSuccess,
  readCheckoutTransactionId,
} from "@/lib/billing/checkoutReturn";
import { openPaddleTransactionCheckout } from "@/lib/billing/paddleCheckout";
import { getStoredAccessToken } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useBillingActivationPoll } from "../_hooks/useBillingActivationPoll";
import { useBillingUsage } from "../_hooks/useBillingUsage";
import { BillingActivationOverlay } from "./BillingActivationOverlay";
import { BillingCheckoutOverlay } from "./BillingCheckoutOverlay";
import { BillingPlanConfirmModal } from "./BillingPlanConfirmModal";
import { BillingUpgradePlanCard } from "./BillingUpgradePlanCard";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

type PendingBillingConfirm =
  | { kind: "change"; planId: PaidPlanId }
  | { kind: "cancel" }
  | null;

export function BillingSettingsClient({
  embedded = false,
  initialUpgradePlan = null,
}: {
  readonly embedded?: boolean;
  readonly initialUpgradePlan?: string | null;
} = {}): ReactElement {
  const { t } = useTranslations();
  const { usage, loading, error, refresh } = useBillingUsage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plans, setPlans] = useState<BillingPlanPublic[]>([]);
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [checkoutBusy, setCheckoutBusy] = useState<PaidPlanId | null>(null);
  const [changeBusy, setChangeBusy] = useState<PaidPlanId | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingBillingConfirm>(null);
  const checkoutHandledRef = useRef(false);

  const activation = useBillingActivationPoll(() => {
    clearCheckoutTransactionId();
    void refresh();
  });

  useEffect(() => {
    void fetchBillingPlans()
      .then((d) => setPlans(d.plans))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (usage?.billing_interval === "month" || usage?.billing_interval === "year") {
      setInterval(usage.billing_interval);
    }
  }, [usage?.billing_interval]);

  const beginActivationFromStorage = useCallback(
    (urlParams?: URLSearchParams) => {
      const expected = sessionStorage.getItem(BILLING_EXPECTED_PLAN_KEY);
      const previous = sessionStorage.getItem(BILLING_PREVIOUS_PLAN_KEY) ?? "free";
      const transactionId = urlParams
        ? readCheckoutTransactionId(urlParams)
        : sessionStorage.getItem(BILLING_TRANSACTION_KEY);
      activation.startActivation(expected ?? "__any_upgrade__", previous, transactionId);
      sessionStorage.removeItem(BILLING_EXPECTED_PLAN_KEY);
      sessionStorage.removeItem(BILLING_PREVIOUS_PLAN_KEY);
    },
    [activation.startActivation],
  );

  const openCheckoutFlow = useCallback(
    async (planId: PaidPlanId, transactionId: string) => {
      sessionStorage.setItem(BILLING_EXPECTED_PLAN_KEY, planId);
      sessionStorage.setItem(BILLING_PREVIOUS_PLAN_KEY, usage?.plan_id ?? "free");
      sessionStorage.setItem(BILLING_TRANSACTION_KEY, transactionId);
      await openPaddleTransactionCheckout(transactionId);
    },
    [usage?.plan_id],
  );

  const handleCheckout = useCallback(
    async (planId: PaidPlanId) => {
      const token = getStoredAccessToken();
      if (!token) {
        return;
      }
      setCheckoutBusy(planId);
      setBanner(null);
      try {
        const { transaction_id } = await startBillingCheckout(token, planId, interval);
        await openCheckoutFlow(planId, transaction_id);
      } catch (e) {
        sessionStorage.removeItem(BILLING_EXPECTED_PLAN_KEY);
        sessionStorage.removeItem(BILLING_PREVIOUS_PLAN_KEY);
        sessionStorage.removeItem(BILLING_TRANSACTION_KEY);
        setBanner(e instanceof Error ? e.message : t("billing.bannerCheckoutFailed"));
      } finally {
        setCheckoutBusy(null);
      }
    },
    [interval, openCheckoutFlow, t],
  );

  const executeChangePlan = useCallback(
    async (planId: PaidPlanId) => {
      const token = getStoredAccessToken();
      if (!token) {
        return;
      }

      const targetName = planDisplayName(planId);
      setChangeBusy(planId);
      setBanner(null);
      try {
        const result = await changeBillingPlan(token, planId, interval);
        if (result.action === "checkout" && result.transaction_id) {
          await openCheckoutFlow(planId, result.transaction_id);
          return;
        }
        await refresh();
        if (result.action === "upgraded") {
          setBanner(result.message ?? t("billing.bannerPlanNowActive", { plan: targetName }));
        } else if (result.action === "downgraded") {
          setBanner(
            result.message ?? t("billing.bannerSwitchScheduled", { plan: targetName }),
          );
        } else {
          setBanner(result.message ?? t("billing.bannerPlanUpdated"));
        }
      } catch (e) {
        setBanner(e instanceof Error ? e.message : t("billing.bannerChangePlanFailed"));
      } finally {
        setChangeBusy(null);
      }
    },
    [interval, openCheckoutFlow, refresh, t],
  );

  const requestChangePlan = useCallback((planId: PaidPlanId) => {
    setPendingConfirm({ kind: "change", planId });
  }, []);

  const executeCancelSubscription = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      return;
    }
    setCancelBusy(true);
    setBanner(null);
    try {
      const result = await cancelBillingSubscription(token, "next_billing_period");
      await refresh();
      setBanner(
        result.billing_status === "canceled"
          ? t("billing.bannerSubscriptionCanceled")
          : t("billing.bannerCancellationScheduled"),
      );
    } catch (e) {
      setBanner(e instanceof Error ? e.message : t("billing.bannerCancelFailed"));
    } finally {
      setCancelBusy(false);
    }
  }, [refresh, t]);

  const requestCancelSubscription = useCallback(() => {
    setPendingConfirm({ kind: "cancel" });
  }, []);

  const handleConfirmModal = useCallback(() => {
    if (!pendingConfirm) {
      return;
    }
    if (pendingConfirm.kind === "change") {
      const planId = pendingConfirm.planId;
      setPendingConfirm(null);
      void executeChangePlan(planId);
      return;
    }
    setPendingConfirm(null);
    void executeCancelSubscription();
  }, [pendingConfirm, executeChangePlan, executeCancelSubscription]);

  useEffect(() => {
    if (isBillingCheckoutSuccess(searchParams)) {
      if (checkoutHandledRef.current) {
        return;
      }
      checkoutHandledRef.current = true;
      setBanner(null);
      if (!embedded) {
        router.replace("/settings/billing", { scroll: false });
      }
      beginActivationFromStorage(searchParams);
      return;
    }
    const checkout = searchParams.get("checkout");
    if (checkout === "canceled") {
      sessionStorage.removeItem(BILLING_EXPECTED_PLAN_KEY);
      sessionStorage.removeItem(BILLING_PREVIOUS_PLAN_KEY);
      sessionStorage.removeItem(BILLING_TRANSACTION_KEY);
      setBanner(t("billing.bannerCheckoutCanceled"));
      if (!embedded) {
        router.replace("/settings/billing", { scroll: false });
      }
    } else if (checkout === "error") {
      setBanner(t("billing.bannerCheckoutError"));
      if (!embedded) {
        router.replace("/settings/billing", { scroll: false });
      }
    }
  }, [embedded, searchParams, router, beginActivationFromStorage, t]);

  useEffect(() => {
    if (activation.phase !== "success") {
      return;
    }
    const planLabel = activation.activatedPlanId
      ? activation.activatedPlanId.charAt(0).toUpperCase() + activation.activatedPlanId.slice(1)
      : t("billing.bannerYourPlan");
    setBanner(t("billing.bannerPlanActive", { plan: planLabel }));
    const timer = window.setTimeout(() => {
      clearCheckoutTransactionId();
      activation.dismiss();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [activation.phase, activation.activatedPlanId, activation.dismiss, t]);

  const upgradePlan = initialUpgradePlan ?? searchParams.get("upgrade");

  useEffect(() => {
    if (!upgradePlan || !isPaidPlan(upgradePlan) || loading || !usage) {
      return;
    }
    if (!embedded) {
      router.replace("/settings/billing", { scroll: false });
    }
    if (isPaidPlan(usage.plan_id)) {
      requestChangePlan(upgradePlan);
      return;
    }
    void handleCheckout(upgradePlan);
  }, [embedded, upgradePlan, loading, usage, handleCheckout, requestChangePlan, router]);

  const activationOpen = activation.phase !== "idle";
  const currentPlanId = usage?.plan_id ?? "free";

  const confirmCopy =
    pendingConfirm?.kind === "cancel"
      ? {
          title: t("billing.cancelTitle"),
          description: t("billing.cancelBody"),
          confirmLabel: t("billing.cancelConfirm"),
          isDanger: true,
          isBusy: cancelBusy,
        }
      : pendingConfirm?.kind === "change"
        ? (() => {
            const targetName = planDisplayName(pendingConfirm.planId);
            const isDowngrade = comparePlanTier(currentPlanId, pendingConfirm.planId) < 0;
            return {
              title: isDowngrade
                ? t("billing.switchPlanTitle", { plan: targetName })
                : t("billing.upgradePlanTitle", { plan: targetName }),
              description: isDowngrade
                ? t("billing.switchPlanBody")
                : t("billing.upgradePlanBody"),
              confirmLabel: isDowngrade ? t("billing.switchPlan") : t("billing.upgrade"),
              isDanger: false,
              isBusy: changeBusy === pendingConfirm.planId,
            };
          })()
        : null;

  return (
    <SettingsSectionPanel title={t("billing.title")}>
      <BillingCheckoutOverlay planId={checkoutBusy ?? changeBusy} />
      <BillingActivationOverlay
        open={activationOpen}
        phase={activation.phase}
        expectedPlanId={activation.expectedPlanId}
        activatedPlanId={activation.activatedPlanId}
        onDismiss={() => {
          clearCheckoutTransactionId();
          activation.dismiss();
        }}
        onRetry={() => {
          activation.dismiss();
          beginActivationFromStorage();
        }}
      />

      {confirmCopy ? (
        <BillingPlanConfirmModal
          open={pendingConfirm !== null}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={confirmCopy.confirmLabel}
          isDanger={confirmCopy.isDanger}
          isBusy={confirmCopy.isBusy}
          onConfirm={handleConfirmModal}
          onCancel={() => {
            if (!confirmCopy.isBusy) {
              setPendingConfirm(null);
            }
          }}
        />
      ) : null}

      {banner ? (
        <div className="mb-6 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-on-surface">
          {banner}
        </div>
      ) : null}

      {loading && !activationOpen ? (
        <p className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("billing.loading")}
        </p>
      ) : null}

      {error ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-error/20 bg-error/5 p-4">
          <p className="text-sm text-error">{error}</p>
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
            onClick={() => void refresh()}
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.retry")}
          </button>
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-on-surface">{t("billing.allPlans")}</h3>
        <div className="inline-flex rounded-full border border-outline-variant/20 p-0.5">
          <button
            type="button"
            onClick={() => setInterval("month")}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              interval === "month" ? "bg-primary text-on-primary" : "text-on-surface-variant"
            }`}
          >
            {t("billing.monthly")}
          </button>
          <button
            type="button"
            onClick={() => setInterval("year")}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              interval === "year" ? "bg-primary text-on-primary" : "text-on-surface-variant"
            }`}
          >
            {t("billing.yearly")}
          </button>
        </div>
      </div>

      <div className="grid auto-rows-fr gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <BillingUpgradePlanCard
            key={plan.plan_id}
            plan={plan}
            interval={interval}
            currentPlanId={usage?.plan_id ?? "free"}
            checkoutBusy={checkoutBusy}
            changeBusy={changeBusy}
            cancelBusy={cancelBusy}
            onCheckout={(planId) => void handleCheckout(planId)}
            onChangePlan={requestChangePlan}
            onCancelSubscription={requestCancelSubscription}
          />
        ))}
      </div>
    </SettingsSectionPanel>
  );
}
