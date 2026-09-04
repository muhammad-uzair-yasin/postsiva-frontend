"use client";

import { CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";
import type { ReactElement } from "react";

import { planDisplayName } from "@/lib/billing/planCardCopy";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { type BillingActivationPhase } from "../_hooks/useBillingActivationPoll";

type BillingActivationOverlayProps = {
  open: boolean;
  phase: BillingActivationPhase;
  expectedPlanId: string | null;
  activatedPlanId: string | null;
  onDismiss: () => void;
  onRetry: () => void;
};

function StepRow({
  done,
  active,
  label,
}: {
  done: boolean;
  active: boolean;
  label: string;
}): ReactElement {
  return (
    <li className="flex items-center gap-3 text-sm">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          done
            ? "bg-secondary text-on-secondary"
            : active
              ? "bg-primary/15 text-primary"
              : "bg-surface-container-high text-on-surface-variant"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      </span>
      <span className={done || active ? "text-on-surface" : "text-on-surface-variant"}>{label}</span>
    </li>
  );
}

function activationHeadline(
  t: (key: string, vars?: Record<string, string>) => string,
  phase: BillingActivationPhase,
  expectedPlanId: string | null,
  activatedPlanId: string | null,
): string {
  switch (phase) {
    case "confirming":
      return t("billing.activationConfirming");
    case "activating":
      return expectedPlanId && expectedPlanId !== "__any_upgrade__"
        ? t("billing.activationActivating", { plan: planDisplayName(expectedPlanId) })
        : t("billing.activationActivatingGeneric");
    case "success":
      return activatedPlanId
        ? t("billing.activationSuccess", { plan: planDisplayName(activatedPlanId) })
        : t("billing.activationSuccessGeneric");
    case "timeout":
      return t("billing.activationTimeout");
    default:
      return "";
  }
}

export function BillingActivationOverlay({
  open,
  phase,
  expectedPlanId,
  activatedPlanId,
  onDismiss,
  onRetry,
}: BillingActivationOverlayProps): ReactElement | null {
  const { t } = useTranslations();

  if (!open || phase === "idle") {
    return null;
  }

  const headline = activationHeadline(t, phase, expectedPlanId, activatedPlanId);
  const paymentDone = phase === "activating" || phase === "success" || phase === "timeout";
  const planDone = phase === "success";
  const isTimeout = phase === "timeout";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="billing-activation-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-xl">
        {phase === "success" ? (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-4 top-4 rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        <div className="mb-5 flex items-center gap-3">
          {phase === "success" ? (
            <CheckCircle2 className="h-8 w-8 text-secondary" />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          <div>
            <h2 id="billing-activation-title" className="text-lg font-bold text-on-surface">
              {headline}
            </h2>
            <p className="text-sm text-on-surface-variant">
              {phase === "success"
                ? t("billing.activationSuccessSubtitle")
                : isTimeout
                  ? t("billing.activationTimeoutSubtitle")
                  : t("billing.activationWaitingSubtitle")}
            </p>
          </div>
        </div>

        <ol className="space-y-3 rounded-xl bg-surface-container-low p-4">
          <StepRow done={paymentDone} active={phase === "confirming"} label={t("billing.activationStepPayment")} />
          <StepRow
            done={planDone}
            active={phase === "activating"}
            label={t("billing.activationStepSubscription")}
          />
          <StepRow done={planDone} active={false} label={t("billing.activationStepLimits")} />
        </ol>

        {isTimeout ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary"
            >
              <RefreshCw className="h-4 w-4" />
              {t("billing.activationCheckAgain")}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm font-bold text-on-surface"
            >
              {t("common.close")}
            </button>
          </div>
        ) : null}

        {phase === "success" ? (
          <button
            type="button"
            onClick={onDismiss}
            className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary"
          >
            {t("billing.activationContinue")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
