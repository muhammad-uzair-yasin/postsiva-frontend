"use client";

import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { useAuthLogout } from "../_hooks/useAuthLogout";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface WorkspaceNavLogoutButtonProps {
  readonly variant: "dashboard" | "selection";
}

export function WorkspaceNavLogoutButton({
  variant,
}: WorkspaceNavLogoutButtonProps): React.ReactElement {
  const { t } = useTranslations();
  const {
    modalOpen,
    busy,
    apiError,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
  } = useAuthLogout();

  const isDashboard = variant === "dashboard";

  const className = isDashboard
    ? "inline-flex items-center gap-2 rounded-full border border-outline-variant bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-secondary/50 hover:bg-surface-container hover:text-secondary sm:px-5 sm:py-2.5 sm:text-[13px]"
    : "inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-surface-container-high hover:text-primary sm:px-5 sm:py-2.5 sm:text-[13px]";

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={t("nav.logout")}
        aria-haspopup="dialog"
        onClick={openLogoutModal}
      >
        <span className="material-symbols-outlined text-[22px] sm:text-2xl" aria-hidden>
          logout
        </span>
        <span className="hidden sm:inline">{t("nav.logout")}</span>
      </button>
      <LogoutConfirmModal
        open={modalOpen}
        busy={busy}
        apiError={apiError}
        onCancel={closeLogoutModal}
        onConfirm={confirmLogout}
      />
    </>
  );
}
