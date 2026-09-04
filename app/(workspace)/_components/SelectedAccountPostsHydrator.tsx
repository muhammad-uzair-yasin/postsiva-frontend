"use client";

import { useEffect } from "react";

import { useContentManagerConnectedChannelLabels } from "@/app/(workspace)/content-manager/_hooks/useContentManagerConnectedChannelLabels";
import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { ensurePublishedPostsForSelectedAccount } from "@/lib/contentManager/ensureSelectedAccountPostsHydrated";

/**
 * Cold-cache hydrate published posts only (forceRefresh=false).
 * Scheduled GET is Calendar-only (week/list hooks) — not called here.
 */
export function SelectedAccountPostsHydrator(): null {
  const { selectedAccount, isLoadingProfiles } = useWorkspaceHeaderAccounts();
  const { labelsByFilter } = useContentManagerConnectedChannelLabels();

  useEffect(() => {
    if (isLoadingProfiles || !selectedAccount || selectedAccount.disabled) {
      return;
    }
    const token = getStoredAccessToken();
    const workspace = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspace?.trim()) {
      return;
    }

    void ensurePublishedPostsForSelectedAccount({
      accessToken: token,
      workspaceId: workspace,
      selectedAccount,
      labels: labelsByFilter,
    });
  }, [isLoadingProfiles, labelsByFilter, selectedAccount]);

  return null;
}
