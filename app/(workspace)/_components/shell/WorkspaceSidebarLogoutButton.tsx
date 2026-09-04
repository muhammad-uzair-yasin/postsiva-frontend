"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useAuthLogout } from "../../_hooks/useAuthLogout";
import { LogoutConfirmModal } from "../LogoutConfirmModal";

interface WorkspaceSidebarLogoutButtonProps {
  readonly showExpandedContent: boolean;
}

export function WorkspaceSidebarLogoutButton({
  showExpandedContent,
}: WorkspaceSidebarLogoutButtonProps): ReactElement {
  const { t } = useTranslations();
  const { modalOpen, busy, apiError, openLogoutModal, closeLogoutModal, confirmLogout } =
    useAuthLogout();

  return (
    <>
      <div
        className={`shrink-0 ${
          showExpandedContent ? "px-3 pb-3" : "flex justify-center px-2 pb-3"
        }`}
      >
        <button
          type="button"
          onClick={openLogoutModal}
          aria-label={t("nav.logout")}
          aria-haspopup="dialog"
          title={showExpandedContent ? undefined : t("nav.logout")}
          className={`text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface ${
            showExpandedContent
              ? "flex w-full items-center gap-3 rounded-lg px-3 py-2.5"
              : "flex h-10 w-10 items-center justify-center rounded-lg p-0"
          }`}
        >
          <span className="material-symbols-outlined shrink-0 text-xl">logout</span>
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
              showExpandedContent ? "max-w-[12rem] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            {t("nav.logout")}
          </span>
        </button>
      </div>
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
