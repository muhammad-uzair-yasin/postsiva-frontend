"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import { useDropdownOpen } from "../../_hooks/useDropdownOpen";
import { WorkspaceAccountDropdownMenu } from "../WorkspaceAccountDropdownMenu";
import { useWorkspaceHeaderAccounts } from "../WorkspaceHeaderAccountsProvider";
import { useWorkspacePlatformsModal } from "../WorkspacePlatformsModalProvider";
import { WorkspaceShellContextDropdownTrigger } from "./WorkspaceShellContextDropdownTrigger";

interface WorkspaceHeaderChannelDropdownProps {
  readonly align?: "left" | "right";
}

export function WorkspaceHeaderChannelDropdown({
  align = "right",
}: WorkspaceHeaderChannelDropdownProps): ReactElement {
  const { t } = useTranslations();
  const { open, toggle, setOpen, containerRef } = useDropdownOpen();
  const { openPlatformsForConnect } = useWorkspacePlatformsModal();
  const {
    accounts,
    selectedAccount,
    setSelectedAccountId,
    isLoadingProfiles,
    profilesError,
    refreshAllUnifiedProfiles,
  } = useWorkspaceHeaderAccounts();

  const triggerIcon = selectedAccount?.iconId ?? "instagram";
  const safeIcon = isSocialPlatformIconId(triggerIcon) ? triggerIcon : "instagram";
  const showAll = selectedAccount !== null && isWorkspaceHeaderAllPlatformsId(selectedAccount.id);
  const triggerLabel = isLoadingProfiles
    ? t("nav.loading")
    : (selectedAccount?.label ?? t("nav.selectChannel"));

  const channelIcon = showAll ? (
    <span className="flex h-full w-full items-center justify-center rounded-md bg-secondary/20 text-secondary">
      <span className="material-symbols-outlined text-lg">all_inclusive</span>
    </span>
  ) : (
    <SocialPlatformIcon platform={safeIcon} className="h-full w-full rounded-md" alt="" />
  );

  return (
    <div ref={containerRef} className="relative shrink-0">
      <WorkspaceShellContextDropdownTrigger
        icon={channelIcon}
        title={triggerLabel}
        subtitle={t("shell.headerSocialType")}
        open={open}
        onClick={toggle}
        ariaLabel={`${t("shell.headerSocialType")}: ${triggerLabel}`}
      />
      {open ? (
        <div
          className={[
            "absolute top-[calc(100%+6px)] z-[80] w-[min(100vw-2rem,360px)] rounded-xl border border-outline-variant/20 bg-surface-container-high shadow-xl",
            align === "right" ? "right-0 left-auto" : "left-0 right-auto",
          ].join(" ")}
        >
          <p className="border-b border-outline-variant/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            {t("shell.socialChannelsLabel")} · {t("shell.headerSocialType")}
          </p>
          <WorkspaceAccountDropdownMenu
            accounts={accounts}
            selectedAccount={selectedAccount}
            profilesError={profilesError}
            isLoadingProfiles={isLoadingProfiles}
            onSelectAccount={(id) => {
              setSelectedAccountId(id);
              setOpen(false);
            }}
            onOpenPlatformsModal={() => {
              setOpen(false);
              openPlatformsForConnect();
            }}
            onRefresh={refreshAllUnifiedProfiles}
          />
        </div>
      ) : null}
    </div>
  );
}
