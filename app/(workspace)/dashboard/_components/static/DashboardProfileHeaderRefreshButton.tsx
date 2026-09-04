"use client";

import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { useWorkspaceHeaderAccounts } from "../../../_components/WorkspaceHeaderAccountsProvider";
import { useDashboardProfileCard } from "../../_hooks/useDashboardProfileCard";

export function DashboardProfileHeaderRefreshButton(): ReactElement | null {
  const { t } = useTranslations();
  const { selectedAccount } = useDashboardProfileCard();
  const { refreshUnifiedProfilesForSelectedAccount } =
    useWorkspaceHeaderAccounts();
  const [busy, setBusy] = useState(false);

  if (!selectedAccount) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={t("dashboard.refreshProfileFromPlatformAria")}
      disabled={busy}
      onClick={() => {
        if (busy) {
          return;
        }
        setBusy(true);
        void refreshUnifiedProfilesForSelectedAccount().finally(() => {
          setBusy(false);
        });
      }}
      className="absolute right-4 top-4 z-20 inline-flex rounded-full border border-outline-variant/20 bg-surface-container-low/90 p-2 text-on-surface-variant shadow-sm backdrop-blur-sm transition hover:border-outline-variant/40 hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:opacity-100"
    >
      <span
        className={`material-symbols-outlined text-xl leading-none ${busy ? "animate-spin" : ""}`}
        aria-hidden
      >
        refresh
      </span>
    </button>
  );
}
