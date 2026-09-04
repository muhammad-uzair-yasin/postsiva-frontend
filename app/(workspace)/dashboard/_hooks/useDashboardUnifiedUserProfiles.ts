"use client";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";

export interface UseDashboardUnifiedUserProfilesResult {
  readonly data: Record<string, unknown> | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

/**
 * Unified profiles loaded for the workspace (same source as the header account picker).
 */
export function useDashboardUnifiedUserProfiles(): UseDashboardUnifiedUserProfilesResult {
  const { unifiedProfiles, isLoadingProfiles, profilesError } =
    useWorkspaceHeaderAccounts();
  return {
    data: unifiedProfiles,
    isLoading: isLoadingProfiles,
    error: profilesError,
  };
}
