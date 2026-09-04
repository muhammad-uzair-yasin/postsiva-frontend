"use client";

import { Suspense, useEffect, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { AccountAppearanceClient } from "@/app/(account)/account/preferences/_components/AccountAppearanceClient";
import { useAccountWorkspaceId } from "@/app/(account)/account/_hooks/useAccountWorkspaceId";
import { ReferEarnContent } from "@/app/(workspace)/referrals/_components/ReferEarnContent";
import { AiUsageDashboardClient } from "@/app/(workspace)/settings/_components/AiUsageDashboardClient";
import { BillingSettingsClient } from "@/app/(workspace)/settings/_components/BillingSettingsClient";
import { ProfileSettingsClient } from "@/app/(workspace)/settings/_components/ProfileSettingsClient";
import { BillingPageLoading } from "@/app/(workspace)/settings/billing/_components/BillingPageLoading";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export type WorkspaceAccountSettingsHref =
  | "/account/profile"
  | "/account/billing"
  | "/account/ai-usage"
  | "/referrals"
  | "/account/preferences";

interface WorkspaceAccountSettingsModalProps {
  readonly open: boolean;
  readonly href: WorkspaceAccountSettingsHref | null;
  readonly titleKey: string;
  readonly billingUpgradePlan?: string | null;
  readonly onClose: () => void;
}

function AccountAiUsagePanel(): ReactElement {
  const workspaceId = useAccountWorkspaceId();
  return <AiUsageDashboardClient workspaceIdOverride={workspaceId} />;
}

function panelBody(
  href: WorkspaceAccountSettingsHref,
  billingUpgradePlan: string | null,
): ReactElement {
  switch (href) {
    case "/account/profile":
      return <ProfileSettingsClient />;
    case "/account/billing":
      return (
        <Suspense fallback={<BillingPageLoading />}>
          <BillingSettingsClient
            embedded
            initialUpgradePlan={billingUpgradePlan}
          />
        </Suspense>
      );
    case "/account/ai-usage":
      return <AccountAiUsagePanel />;
    case "/referrals":
      return <ReferEarnContent />;
    case "/account/preferences":
      return <AccountAppearanceClient />;
    default:
      return <ProfileSettingsClient />;
  }
}

export function WorkspaceAccountSettingsModal({
  open,
  href,
  titleKey,
  billingUpgradePlan = null,
  onClose,
}: WorkspaceAccountSettingsModalProps): ReactElement | null {
  const { t } = useTranslations();
  const root = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !href || !root) return null;

  const title = t(titleKey);

  return createPortal(
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label={t("adPlatform.closeDialog")}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-account-settings-title"
        className="relative z-[1] flex h-[min(92dvh,80dvh)] max-h-[92dvh] w-[min(95vw,80vw)] max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface shadow-2xl sm:h-[80dvh] sm:max-h-[80dvh] sm:w-[80vw] sm:max-w-[80vw]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/15 px-4 py-3 sm:px-5">
          <h2
            id="workspace-account-settings-title"
            className="min-w-0 truncate font-headline text-base font-bold text-on-surface sm:text-lg"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label={t("adPlatform.closeDialog")}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden>
              close
            </span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-4 sm:px-6">
          {panelBody(href, billingUpgradePlan)}
        </div>
      </div>
    </div>,
    root,
  );
}
