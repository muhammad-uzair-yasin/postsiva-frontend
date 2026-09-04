"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  connectCanvaAccount,
  disconnectCanvaAccount,
  fetchCanvaConnectionInfo,
  type CanvaConnectionInfo,
} from "@/lib/social/canvaApi";
import { renderOAuthConnectPopupLoadingPage } from "@/lib/social/renderOAuthConnectPopupLoadingPage";

export function useCanvaConnection(): {
  connected: boolean;
  accountLabel: string | null;
  loading: boolean;
  connecting: boolean;
  disconnecting: boolean;
  error: string | null;
  reload: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
} {
  const { t } = useTranslations();
  const [info, setInfo] = useState<CanvaConnectionInfo>({ connected: false, accountLabel: null });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupMonitorRef = useRef<number | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setInfo({ connected: false, accountLabel: null });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const next = await fetchCanvaConnectionInfo(token, workspaceId);
      setInfo(next);
      setError(null);
    } catch (e) {
      setInfo({ connected: false, accountLabel: null });
      setError(e instanceof Error ? e.message : t("designing.errorLoad"));
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

  const connect = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setError(t("cloudStorage.errorSignIn"));
      return;
    }
    setError(null);
    setConnecting(true);
    const width = 560;
    const height = 720;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    const features = `popup=yes,width=${width},height=${height},left=${left},top=${top}`;
    const popup = window.open("", "postsiva-canva-connect", features);
    if (!popup) {
      setError(t("cloudStorage.errorPopupBlocked"));
      setConnecting(false);
      return;
    }
    renderOAuthConnectPopupLoadingPage(popup);
    try {
      const authorizeUrl = await connectCanvaAccount(token, workspaceId);
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
        setConnecting(false);
        void reload();
      }, 500);
    } catch (e) {
      if (!popup.closed) {
        popup.close();
      }
      setConnecting(false);
      setError(e instanceof Error ? e.message : t("designing.errorConnect"));
    }
  }, [reload, t]);

  const disconnect = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setError(t("cloudStorage.errorSignIn"));
      return;
    }
    setDisconnecting(true);
    setError(null);
    try {
      await disconnectCanvaAccount(token, workspaceId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("designing.errorDisconnect"));
    } finally {
      setDisconnecting(false);
    }
  }, [reload, t]);

  return {
    connected: info.connected,
    accountLabel: info.accountLabel,
    loading,
    connecting,
    disconnecting,
    error,
    reload,
    connect,
    disconnect,
  };
}
