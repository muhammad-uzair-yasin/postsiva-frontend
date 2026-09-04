"use client";

import { useEffect, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { PlanLimitKind } from "@/lib/billing/UpgradePlanLimitProvider";

type UpgradePlanLimitModalProps = {
  readonly open: boolean;
  readonly kind: PlanLimitKind;
  readonly onClose: () => void;
  readonly onUpgrade: () => void;
};

function bodyKeyForKind(kind: PlanLimitKind): string {
  switch (kind) {
    case "workspaces":
      return "billing.upgradeLimitBodyWorkspaces";
    case "team_members":
      return "billing.upgradeLimitBodyTeamMembers";
    default:
      return "billing.upgradeLimitBodyAccounts";
  }
}

export function UpgradePlanLimitModal({
  open,
  kind,
  onClose,
  onUpgrade,
}: UpgradePlanLimitModalProps): ReactElement | null {
  const { t } = useTranslations();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-plan-limit-title"
        aria-describedby="upgrade-plan-limit-desc"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(107, 73, 216, 0.35) 0%, transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 p-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
            <span className="material-symbols-outlined text-2xl text-primary">upgrade</span>
          </span>
          <h2
            id="upgrade-plan-limit-title"
            className="mt-4 font-headline text-xl font-bold tracking-tight text-on-surface"
          >
            {t("billing.upgradeLimitTitle")}
          </h2>
          <p
            id="upgrade-plan-limit-desc"
            className="mt-2 text-sm leading-relaxed text-on-surface-variant"
          >
            {t(bodyKeyForKind(kind))}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
            >
              {t("workspaces.createCancel")}
            </button>
            <button
              type="button"
              onClick={onUpgrade}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 hover:brightness-110"
            >
              {t("billing.upgradeLimitCta")}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
