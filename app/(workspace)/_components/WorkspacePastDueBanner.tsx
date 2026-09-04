"use client";

import { usePathname } from "next/navigation";

import { useWorkspaceAccountSettings } from "@/app/(workspace)/_components/shell/WorkspaceAccountSettingsProvider";
import { useBilling } from "@/lib/billing/BillingContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { WorkspaceNoticeBanner } from "./WorkspaceNoticeBanner";

function planLabel(planId: string): string {
  const normalized = planId === "agency" ? "pro" : planId;
  if (normalized === "free") return "Pro";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function WorkspacePastDueBanner(): React.ReactElement | null {
  const { t } = useTranslations();
  const pathname = usePathname();
  const { openBillingSettings } = useWorkspaceAccountSettings();
  const { usage, loading } = useBilling();

  if (
    pathname.startsWith("/workspaces") ||
    pathname.startsWith("/account/billing") ||
    pathname.startsWith("/settings/billing") ||
    loading ||
    !usage ||
    usage.billing_status !== "past_due"
  ) {
    return null;
  }

  const expired = Boolean(usage.past_due_grace_expired);
  const days =
    usage.past_due_days_remaining ?? usage.past_due_grace_days ?? 5;
  const label = planLabel(usage.plan_id);

  return (
    <div className="relative z-40 px-3 pb-3 sm:px-6" role="status">
      <WorkspaceNoticeBanner
        tone="warning"
        icon="credit_card_off"
        body={t("dashboard.pastDueBannerBody")}
        detail={
          expired
            ? t("dashboard.pastDueBannerExpiredDetail", { plan: label })
            : t("dashboard.pastDueBannerDetail", { plan: label, days })
        }
        cta={t("dashboard.pastDueBannerCta")}
        onAction={() => openBillingSettings()}
      />
    </div>
  );
}
