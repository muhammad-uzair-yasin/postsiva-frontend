"use client";

import { useCallback, useState } from "react";

import { formatUserFacingApiError } from "@/lib/api/formatUserFacingApiError";
import { getStoredAccessToken } from "@/lib/auth/session";
import {
  deleteOAuthTokenForWorkspace,
  refreshStoredWorkspacesFromApi,
} from "@/lib/social/unifiedOAuthApi";

export function useDisconnectWorkspaceChannel(
  workspaceId: string | null,
): {
  disconnectingPlatform: string | null;
  disconnectError: string | null;
  clearError: () => void;
  runDisconnect: (oauthPlatform: string) => Promise<boolean>;
} {
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<
    string | null
  >(null);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setDisconnectError(null);
  }, []);

  const runDisconnect = useCallback(
    async (oauthPlatform: string): Promise<boolean> => {
      if (!workspaceId) {
        return false;
      }
      const token = getStoredAccessToken();
      if (!token) {
        setDisconnectError("Not signed in");
        return false;
      }
      setDisconnectError(null);
      setDisconnectingPlatform(oauthPlatform);
      try {
        await deleteOAuthTokenForWorkspace(token, workspaceId, oauthPlatform);
        await refreshStoredWorkspacesFromApi(token);
        return true;
      } catch (e) {
        setDisconnectError(
          formatUserFacingApiError(
            e instanceof Error ? e.message : "Disconnect failed",
          ),
        );
        return false;
      } finally {
        setDisconnectingPlatform(null);
      }
    },
    [workspaceId],
  );

  return {
    disconnectingPlatform,
    disconnectError,
    clearError,
    runDisconnect,
  };
}
