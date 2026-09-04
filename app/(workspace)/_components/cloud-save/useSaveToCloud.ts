"use client";

import { useCallback, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  exportToCloud,
  listCloudConnections,
  type CloudExportSource,
  type CloudProvider,
} from "@/lib/social/cloudStorageApi";

export type SaveStatus = "idle" | "saving" | "success" | "error";

export interface SaveResult {
  provider: CloudProvider;
  status: Exclude<SaveStatus, "idle">;
  message?: string;
}

interface Session {
  token: string;
  workspaceId: string;
}

function readSession(): Session | null {
  const token = getStoredAccessToken();
  const workspaceId = getStoredActiveWorkspaceId();
  if (!token?.trim() || !workspaceId?.trim()) {
    return null;
  }
  return { token, workspaceId };
}

/**
 * Owns the cloud-export lifecycle for a single source: which providers are
 * connected, the in-flight/last status, and the export call itself. The source
 * asset is never mutated — this only creates a copy in the target drive.
 */
export function useSaveToCloud(source: CloudExportSource) {
  const { t } = useTranslations();
  const [connected, setConnected] = useState<Set<CloudProvider> | null>(null);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [result, setResult] = useState<SaveResult | null>(null);
  const loadedRef = useRef(false);

  const loadConnections = useCallback(async (): Promise<void> => {
    if (loadedRef.current) {
      return;
    }
    const session = readSession();
    if (!session) {
      setConnectionsError(t("cloudSave.signInFirst"));
      return;
    }
    setLoadingConnections(true);
    setConnectionsError(null);
    try {
      const conns = await listCloudConnections(session.token, session.workspaceId);
      const set = new Set<CloudProvider>(
        conns.filter((c) => c.status === "connected").map((c) => c.provider),
      );
      setConnected(set);
      loadedRef.current = true;
    } catch (e) {
      setConnectionsError(
        e instanceof Error ? e.message : t("cloudSave.loadConnectionsError"),
      );
    } finally {
      setLoadingConnections(false);
    }
  }, [t]);

  const save = useCallback(
    async (provider: CloudProvider, destinationFolderId?: string): Promise<void> => {
      const session = readSession();
      if (!session) {
        setStatus("error");
        setResult({ provider, status: "error", message: t("cloudSave.signInFirst") });
        return;
      }
      setStatus("saving");
      setResult(null);
      const providerLabel = t(`cloudSave.${providerKey(provider)}`);
      try {
        await exportToCloud(
          session.token,
          session.workspaceId,
          provider,
          source,
          destinationFolderId,
        );
        setStatus("success");
        setResult({
          provider,
          status: "success",
          message: t("cloudSave.savedTo", { provider: providerLabel }),
        });
      } catch (e) {
        setStatus("error");
        setResult({
          provider,
          status: "error",
          message:
            e instanceof Error
              ? e.message
              : t("cloudSave.saveFailed", { provider: providerLabel }),
        });
      }
    },
    [source, t],
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setResult(null);
  }, []);

  return {
    connected,
    loadingConnections,
    connectionsError,
    status,
    result,
    loadConnections,
    save,
    reset,
  };
}

function providerKey(provider: CloudProvider): "googleDrive" | "onedrive" | "dropbox" {
  if (provider === "google_drive") {
    return "googleDrive";
  }
  return provider;
}
