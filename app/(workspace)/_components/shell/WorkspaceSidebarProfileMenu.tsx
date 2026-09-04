"use client";

import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

import {
  profileImageUrlFromUser,
  userAvatarInitialsFromUser,
} from "@/lib/auth/userAvatar";
import { useBilling } from "@/lib/billing/BillingContext";
import { planDisplayName } from "@/lib/billing/planCardCopy";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatWorkspaceDisplayName } from "@/lib/workspace/formatWorkspaceDisplayName";

import { useAuthLogout } from "../../_hooks/useAuthLogout";
import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";
import { useDropdownOpen } from "../../_hooks/useDropdownOpen";
import { useStoredAuthUser } from "../../_hooks/useStoredAuthUser";
import { useStoredWorkspaces } from "../../workspaces/_hooks/useStoredWorkspaces";
import { LogoutConfirmModal } from "../LogoutConfirmModal";
import { useWorkspaceAccountSettings } from "./WorkspaceAccountSettingsProvider";
import { WorkspaceSidebarProfileMenuHeader } from "./WorkspaceSidebarProfileMenuHeader";

interface WorkspaceSidebarProfileMenuProps {
  readonly showExpandedContent: boolean;
  readonly collapseButton: ReactNode;
}

function MenuRow({
  icon,
  label,
  onClick,
  href,
  trailing,
}: {
  readonly icon: string;
  readonly label: string;
  readonly onClick?: () => void;
  readonly href?: string;
  readonly trailing?: ReactNode;
}): ReactElement {
  const className =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright/80";

  const inner = (
    <>
      <span className="material-symbols-outlined shrink-0 text-[20px] text-on-surface-variant">
        {icon}
      </span>
      <span className="min-w-0 flex-1 break-words">{label}</span>
      {trailing}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  );
}

export function WorkspaceSidebarProfileMenu({
  showExpandedContent,
  collapseButton,
}: WorkspaceSidebarProfileMenuProps): ReactElement {
  const { t } = useTranslations();
  const { open, toggle, setOpen, containerRef } = useDropdownOpen();
  const { user, isReady } = useStoredAuthUser();
  const { openAccountSettings, openBillingSettings } = useWorkspaceAccountSettings();
  const { modalOpen, busy, apiError, openLogoutModal, closeLogoutModal, confirmLogout } =
    useAuthLogout();
  const { usage, planId, loading } = useBilling();
  const activeId = useActiveWorkspaceId();
  const { workspaces } = useStoredWorkspaces();
  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null;

  const profileName =
    user?.full_name?.trim() ||
    user?.username?.trim() ||
    user?.email?.split("@")[0] ||
    t("settings.account");
  const email = user?.email?.trim() || "";
  const workspaceName = formatWorkspaceDisplayName(
    active?.name?.trim() || t("settings.workspace"),
  );
  const imageUrl = user ? profileImageUrlFromUser(user) : null;
  const initials = user ? userAvatarInitialsFromUser(user) : "?";

  const effectivePlan = usage?.plan_id ?? planId;
  const normalizedPlan = effectivePlan === "agency" ? "pro" : effectivePlan;
  const planName = planDisplayName(normalizedPlan);
  const channelCount = usage?.usage_counts.connected_accounts ?? 0;
  const showUpgrade = normalizedPlan === "free" || normalizedPlan === "starter";

  const close = (): void => setOpen(false);
  const run = (action: () => void): void => {
    close();
    action();
  };


  const popupPanel = open ? (
    <div
      role="menu"
      className="overflow-visible rounded-xl border border-outline-variant/45 bg-surface-container-highest shadow-[0_-10px_36px_rgba(0,0,0,0.42)] ring-1 ring-outline-variant/25"
    >
      <WorkspaceSidebarProfileMenuHeader
        workspaceName={workspaceName}
        workspaceImageUrl={active?.image_url}
        planName={planName}
        channelCount={channelCount}
        planLoading={loading && !usage}
        showUpgrade={showUpgrade}
        onUpgrade={() => run(() => openBillingSettings())}
      />

      <div className="space-y-0.5 bg-surface-container-highest p-1.5">
        <MenuRow
          icon="account_circle"
          label={t("settings.profile")}
          onClick={() => run(() => openAccountSettings("/account/profile", "settings.profile"))}
        />
        <MenuRow
          icon="payments"
          label={t("billing.title")}
          onClick={() => run(() => openBillingSettings())}
        />
        <MenuRow
          icon="bolt"
          label={t("settings.aiUsage")}
          onClick={() => run(() => openAccountSettings("/account/ai-usage", "settings.aiUsage"))}
        />
        <MenuRow
          icon="card_giftcard"
          label={t("nav.referEarn")}
          onClick={() => run(() => openAccountSettings("/referrals", "nav.referEarn"))}
        />
        <MenuRow
          icon="palette"
          label={t("preferences.appearance")}
          onClick={() =>
            run(() => openAccountSettings("/account/preferences", "preferences.appearance"))
          }
        />
        <MenuRow
          icon="help"
          label={t("shell.sidebarProfileHelp")}
          href="/help"
          onClick={close}
        />
      </div>

      <div className="border-t border-outline-variant/35 bg-surface-container-highest p-1.5">
        <MenuRow icon="logout" label={t("nav.logout")} onClick={() => run(openLogoutModal)} />
      </div>
    </div>
  ) : null;

  return (
    <>
      <div
        ref={containerRef}
        className={`relative shrink-0 border-t ${
          open ? "border-outline-variant/35" : "border-outline-variant/15"
        }`}
      >
        {showExpandedContent && popupPanel ? (
          <div className="absolute bottom-full left-0 right-0 z-[70] pb-2">{popupPanel}</div>
        ) : null}

        {showExpandedContent ? (
          <div className="flex min-h-[3.25rem] w-full items-center gap-2.5 px-3 py-4">
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-label={t("shell.sidebarProfileCardAria", {
                name: profileName,
                plan: t("shell.sidebarPlanLabel", { plan: planName }),
              })}
              className={`group flex min-h-[3.25rem] min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-lg px-1 py-2 text-left transition-colors hover:bg-surface-container-high ${
                open
                  ? "bg-surface-container-high ring-1 ring-outline-variant/40"
                  : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-container text-on-primary-container">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold">{isReady ? initials : "…"}</span>
                )}
              </span>
              <span className="min-w-0 flex-1 overflow-hidden py-0.5">
                <span className="block truncate text-sm font-semibold leading-5 text-on-surface">
                  {profileName}
                </span>
                {email ? (
                  <span className="mt-1 block truncate text-[11px] leading-4 text-on-surface-variant group-hover:text-on-surface">
                    {email}
                  </span>
                ) : null}
                <span className="mt-1 block truncate text-xs font-semibold leading-4 text-primary">
                  {loading && !usage
                    ? t("dashboard.planLoading")
                    : t("shell.sidebarPlanLabel", { plan: planName })}
                </span>
              </span>
            </button>
            {collapseButton}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-2 py-4">
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-label={t("shell.sidebarProfileCardAria", {
                name: profileName,
                plan: t("shell.sidebarPlanLabel", { plan: planName }),
              })}
              title={profileName}
              className="rounded-lg transition-colors hover:bg-surface-container-high"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-container text-on-primary-container">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold">{isReady ? initials : "…"}</span>
                )}
              </span>
            </button>
            {!showExpandedContent && open && popupPanel ? (
              <div className="absolute bottom-0 left-full z-[70] ml-2 w-64 pb-2">{popupPanel}</div>
            ) : null}
            {collapseButton}
          </div>
        )}
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
