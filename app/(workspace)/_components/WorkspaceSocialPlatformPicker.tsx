"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import { WorkspaceAccountDropdownMenu } from "./WorkspaceAccountDropdownMenu";
import { useWorkspaceHeaderAccounts } from "./WorkspaceHeaderAccountsProvider";
import { useWorkspacePlatformsModal } from "./WorkspacePlatformsModalProvider";

export function WorkspaceSocialPlatformPicker(): ReactElement {
  const { t } = useTranslations();
  const {
    accounts,
    selectedAccount,
    setSelectedAccountId,
    isLoadingProfiles,
    profilesError,
  } = useWorkspaceHeaderAccounts();
  const { openPlatformsForConnect } = useWorkspacePlatformsModal();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDoc = (e: MouseEvent): void => {
      if (rootRef.current?.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerIcon = selectedAccount?.iconId ?? "instagram";
  const safeIcon = isSocialPlatformIconId(triggerIcon) ? triggerIcon : "instagram";
  const showAllPlatformsTrigger =
    selectedAccount !== null &&
    isWorkspaceHeaderAllPlatformsId(selectedAccount.id);
  const triggerLabel = isLoadingProfiles
    ? t("nav.loading")
    : profilesError ??
      (selectedAccount?.label ??
        (accounts.length === 0 ? t("nav.noAccounts") : t("settings.account")));

  const handleOpenPlatforms = (): void => {
    setOpen(false);
    openPlatformsForConnect();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t("nav.chooseConnectedAccount")}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isLoadingProfiles && accounts.length === 0}
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="flex max-w-[18rem] items-center gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-2.5 text-on-surface-variant shadow-sm transition-all duration-200 ease-out hover:border-secondary/35 hover:bg-surface-container-high hover:text-secondary active:scale-[0.99] disabled:opacity-60 md:max-w-[20rem] md:px-4 md:py-3"
      >
        {showAllPlatformsTrigger ? (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary/15 text-secondary sm:h-10 sm:w-10"
            aria-hidden
          >
            <span className="material-symbols-outlined text-[26px] sm:text-[28px]">
              all_inclusive
            </span>
          </span>
        ) : (
          <SocialPlatformIcon
            platform={safeIcon}
            className="h-9 w-9 shrink-0 rounded-md sm:h-10 sm:w-10"
            alt=""
          />
        )}
        <span className="hidden min-w-0 flex-1 truncate text-left text-base font-semibold text-on-surface sm:inline">
          {triggerLabel}
        </span>
        <span
          className={`material-symbols-outlined shrink-0 text-[26px] leading-none text-on-surface-variant transition-transform duration-200 ease-out sm:text-[28px] ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 z-[60] mt-2">
          <WorkspaceAccountDropdownMenu
            accounts={accounts}
            selectedAccount={selectedAccount}
            profilesError={profilesError}
            isLoadingProfiles={isLoadingProfiles}
            onSelectAccount={(id) => {
              setSelectedAccountId(id);
              setOpen(false);
            }}
            onOpenPlatformsModal={handleOpenPlatforms}
          />
        </div>
      ) : null}
    </div>
  );
}
