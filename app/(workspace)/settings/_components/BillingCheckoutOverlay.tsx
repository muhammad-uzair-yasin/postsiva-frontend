"use client";

import { CreditCard, Loader2 } from "lucide-react";
import type { ReactElement } from "react";

import { planDisplayName } from "@/lib/billing/planCardCopy";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

type BillingCheckoutOverlayProps = {
  planId: string | null;
};

export function BillingCheckoutOverlay({ planId }: BillingCheckoutOverlayProps): ReactElement | null {
  const { t } = useTranslations();

  if (!planId) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-scrim/40 p-4 backdrop-blur-[2px]"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex max-w-sm items-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-5 py-4 shadow-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">{t("billing.checkoutOpening")}</p>
          <p className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {planDisplayName(planId)} · Paddle
          </p>
        </div>
      </div>
    </div>
  );
}
