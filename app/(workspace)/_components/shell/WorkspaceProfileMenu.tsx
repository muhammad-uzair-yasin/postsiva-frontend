"use client";

import type { ReactElement } from "react";

import { profileImageUrlFromUser } from "@/lib/auth/userAvatar";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useAuthLogout } from "../../_hooks/useAuthLogout";
import { useStoredAuthUser } from "../../_hooks/useStoredAuthUser";
import { useDropdownOpen } from "../../_hooks/useDropdownOpen";
import { LogoutConfirmModal } from "../LogoutConfirmModal";
import {
  type WorkspaceAccountSettingsHref,
} from "./WorkspaceAccountSettingsModal";
import { useWorkspaceAccountSettings } from "./WorkspaceAccountSettingsProvider";

const PROFILE_LINKS: readonly {
  href: WorkspaceAccountSettingsHref;
  labelKey: string;
  icon: string;
}[] = [
  { href: "/account/profile", labelKey: "settings.profile", icon: "account_circle" },
  { href: "/account/billing", labelKey: "billing.title", icon: "credit_card" },
  { href: "/account/ai-usage", labelKey: "settings.aiUsage", icon: "bolt" },
  { href: "/referrals", labelKey: "nav.referEarn", icon: "card_giftcard" },
  { href: "/account/preferences", labelKey: "preferences.appearance", icon: "palette" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

export function WorkspaceProfileMenu(): ReactElement {
  const { t } = useTranslations();
  const { user, isReady } = useStoredAuthUser();
  const { open, toggle, setOpen, containerRef } = useDropdownOpen();
  const { modalOpen, busy, apiError, openLogoutModal, closeLogoutModal, confirmLogout } =
    useAuthLogout();
  const { openAccountSettings } = useWorkspaceAccountSettings();

  const displayName = user?.full_name?.trim() || user?.username?.trim() || user?.email?.split("@")[0] || t("settings.account");
  const imageUrl = user ? profileImageUrlFromUser(user) : null;

  return (
    <>
      <div ref={containerRef} className="relative shrink-0">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={t("nav.accountAndSettings")}
          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-outline-variant/25 bg-primary-container ring-2 ring-primary/20 transition-colors hover:bg-surface-container-high sm:h-12 sm:w-12"
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-on-primary-container">
              {isReady ? initials(displayName) : "…"}
            </span>
          )}
        </button>
        {open ? (
          <div className="absolute right-0 top-[calc(100%+6px)] z-[80] w-56 rounded-xl border border-outline-variant/20 bg-surface-container-high py-1 shadow-xl">
            <p className="truncate px-3 py-2 text-sm font-bold text-on-surface">{displayName}</p>
            <ul className="border-t border-outline-variant/15 py-1">
              {PROFILE_LINKS.map((item) => (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openAccountSettings(item.href, item.labelKey);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    {t(item.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-outline-variant/15 p-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openLogoutModal();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                {t("nav.logout")}
              </button>
            </div>
          </div>
        ) : null}
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
