"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  createWorkspaceApiKey,
  listWorkspaceApiKeys,
  revealWorkspaceApiKeySecret,
  revokeWorkspaceApiKey,
  type WorkspaceAPIKeyListItem,
} from "@/lib/settings/workspaceApiKeysApi";

export interface UseWorkspaceApiKeysResult {
  keys: WorkspaceAPIKeyListItem[];
  loading: boolean;
  error: string | null;
  busy: boolean;
  refresh: () => Promise<void>;
  createKey: (name: string | null, scope?: string) => Promise<string>;
  revealKeySecret: (keyId: string) => Promise<string>;
  revokeKey: (keyId: string) => Promise<void>;
}

export function useWorkspaceApiKeys(): UseWorkspaceApiKeysResult {
  const [keys, setKeys] = useState<WorkspaceAPIKeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setKeys([]);
        setError("Select a workspace to manage API keys.");
        return;
      }
      const list = await listWorkspaceApiKeys(token, ws);
      setKeys(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load API keys");
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createKey = useCallback(
    async (name: string | null, scope = "full"): Promise<string> => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        throw new Error("Select a workspace to create API keys.");
      }
      const trimmed = name?.trim() ?? "";
      setBusy(true);
      try {
        const created = await createWorkspaceApiKey(token, ws, {
          name: trimmed.length > 0 ? trimmed : null,
          scope,
        });
        await refresh();
        return created.secret;
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const revokeKey = useCallback(
    async (keyId: string): Promise<void> => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        return;
      }
      setBusy(true);
      try {
        await revokeWorkspaceApiKey(token, ws, keyId);
        await refresh();
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const revealKeySecret = useCallback(
    async (keyId: string): Promise<string> => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        throw new Error("Select a workspace to view API keys.");
      }

      setBusy(true);
      try {
        const resp = await revealWorkspaceApiKeySecret(token, ws, keyId);
        return resp.secret;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { keys, loading, error, busy, refresh, createKey, revealKeySecret, revokeKey };
}
