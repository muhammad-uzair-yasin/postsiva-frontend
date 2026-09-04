"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { renderOAuthConnectPopupLoadingPage } from "@/lib/social/renderOAuthConnectPopupLoadingPage";
import {
  disconnectCloudProvider,
  getCloudOAuthUrl,
  listCloudConnections,
  type CloudConnection,
  type CloudProvider,
} from "@/lib/social/cloudStorageApi";

interface UseCloudConnectionsResult {
  connections: CloudConnection[];
  loading: boolean;
  error: string | null;
  connectingProvider: CloudProvider | null;
  disconnectingProvider: CloudProvider | null;
  reload: () => Promise<void>;
  connect: (provider: CloudProvider) => Promise<void>;
  disconnect: (provider: CloudProvider) => Promise<void>;
  connectionFor: (provider: CloudProvider) => CloudConnection | undefined;
}

// Gate-free popup landing page: reports status + closes. Must NOT be a
// workspace-gated route, or a failed connect bounces the popup to /verify-otp.
const RETURN_PATH = "/auth/cloud/complete";

/**
 * Loads cloud-storage connections and drives the connect (OAuth popup) /
 * disconnect flows. The popup returns to `?cloud=connected|error&provider=…`;
 * closing it triggers a reload so the card reflects the new status.
 */
export function useCloudConnections(): UseCloudConnectionsResult {
  const { t } = useTranslations();
  const [connections, setConnections] = useState<CloudConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<CloudProvider | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<CloudProvider | null>(null);
  const popupMonitorRef = useRef<number | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setConnections([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await listCloudConnections(token, workspaceId);
      setConnections(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("cloudStorage.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void reload();
    return () => {
      if (popupMonitorRef.current !== null) {
        window.clearInterval(popupMonitorRef.current);
      }
    };
  }, [reload]);

  // Refresh as soon as the popup reports back (don't wait for it to be closed).
  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== window.location.origin) {
        return;
      }
      const data = event.data as { type?: string; cloud?: string } | null;
      if (data?.type !== "postsiva-cloud-connect") {
        return;
      }
      if (data.cloud === "error") {
        setError(t("cloudStorage.errorConnect"));
      }
      setConnectingProvider(null);
      void reload();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [reload, t]);

  const connect = useCallback(
    async (provider: CloudProvider): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setError(t("cloudStorage.errorSignIn"));
        return;
      }
      setError(null);
      setConnectingProvider(provider);
      const width = 560;
      const height = 720;
      const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
      const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
      const features = `popup=yes,width=${width},height=${height},left=${left},top=${top}`;
      const popup = window.open("", "postsiva-cloud-connect", features);
      if (!popup) {
        setError(t("cloudStorage.errorPopupBlocked"));
        setConnectingProvider(null);
        return;
      }
      renderOAuthConnectPopupLoadingPage(popup);
      try {
        const authorizeUrl = await getCloudOAuthUrl(token, workspaceId, provider, RETURN_PATH);
        popup.location.href = authorizeUrl;
        if (popupMonitorRef.current !== null) {
          window.clearInterval(popupMonitorRef.current);
        }
        popupMonitorRef.current = window.setInterval(() => {
          if (!popup.closed) {
            return;
          }
          if (popupMonitorRef.current !== null) {
            window.clearInterval(popupMonitorRef.current);
            popupMonitorRef.current = null;
          }
          setConnectingProvider(null);
          void reload();
        }, 500);
      } catch (e) {
        if (!popup.closed) {
          popup.close();
        }
        setError(e instanceof Error ? e.message : t("cloudStorage.errorConnect"));
        setConnectingProvider(null);
      }
    },
    [reload, t],
  );

  const disconnect = useCallback(
    async (provider: CloudProvider): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setError(t("cloudStorage.errorSignIn"));
        return;
      }
      setError(null);
      setDisconnectingProvider(provider);
      try {
        await disconnectCloudProvider(token, workspaceId, provider);
        await reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : t("cloudStorage.errorDisconnect"));
      } finally {
        setDisconnectingProvider(null);
      }
    },
    [reload, t],
  );

  const connectionFor = useCallback(
    (provider: CloudProvider): CloudConnection | undefined =>
      connections.find((c) => c.provider === provider),
    [connections],
  );

  return {
    connections,
    loading,
    error,
    connectingProvider,
    disconnectingProvider,
    reload,
    connect,
    disconnect,
    connectionFor,
  };
}
