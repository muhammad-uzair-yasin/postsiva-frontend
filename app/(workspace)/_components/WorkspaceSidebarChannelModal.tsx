"use client";

import { useEffect, type ReactElement } from "react";
import { WorkspaceAccountDropdownMenu } from "./WorkspaceAccountDropdownMenu";
import { useWorkspaceHeaderAccounts } from "./WorkspaceHeaderAccountsProvider";
import { useWorkspacePlatformsModal } from "./WorkspacePlatformsModalProvider";

interface WorkspaceSidebarChannelModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function WorkspaceSidebarChannelModal({
  isOpen,
  onClose,
}: WorkspaceSidebarChannelModalProps): ReactElement | null {
  const {
    accounts,
    selectedAccount,
    setSelectedAccountId,
    isLoadingProfiles,
    profilesError,
    refreshAllUnifiedProfiles,
  } = useWorkspaceHeaderAccounts();
  const { openPlatformsForConnect } = useWorkspacePlatformsModal();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectAccount = (id: string): void => {
    setSelectedAccountId(id);
    onClose();
  };

  const handleOpenPlatforms = (): void => {
    onClose();
    openPlatformsForConnect();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="m-4 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <WorkspaceAccountDropdownMenu
          accounts={accounts}
          selectedAccount={selectedAccount}
          profilesError={profilesError}
          isLoadingProfiles={isLoadingProfiles}
          onSelectAccount={handleSelectAccount}
          onOpenPlatformsModal={handleOpenPlatforms}
          onRefresh={refreshAllUnifiedProfiles}
        />
      </div>
    </div>
  );
}
