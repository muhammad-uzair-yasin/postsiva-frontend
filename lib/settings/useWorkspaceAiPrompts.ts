"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import {
  createWorkspaceAiPrompt,
  deleteWorkspaceAiPrompt,
  fetchWorkspaceAiPrompts,
  updateWorkspaceAiPrompt,
  type WorkspaceAiPrompt,
} from "@/lib/settings/workspaceAiPromptsApi";

function requireSession(): { token: string; workspaceId: string } {
  const token = getStoredAccessToken();
  const workspaceId = getStoredActiveWorkspaceId();
  if (!token?.trim() || !workspaceId?.trim()) {
    throw new Error("Sign in and select a workspace first.");
  }
  return { token, workspaceId };
}

export function useWorkspaceAiPrompts(options?: { autoLoad?: boolean }) {
  const autoLoad = options?.autoLoad !== false;
  const [items, setItems] = useState<WorkspaceAiPrompt[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { token, workspaceId } = requireSession();
      const data = await fetchWorkspaceAiPrompts(token, workspaceId);
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load prompts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) void reload();
  }, [autoLoad, reload]);

  const create = useCallback(async (title: string, body: string) => {
    setSaving(true);
    setError(null);
    try {
      const { token, workspaceId } = requireSession();
      const row = await createWorkspaceAiPrompt(token, workspaceId, { title, body });
      setItems((prev) => [...prev, row]);
      return row;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save prompt.";
      setError(msg);
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(
    async (promptId: string, patch: { title?: string; body?: string }) => {
      setSaving(true);
      setError(null);
      try {
        const { token, workspaceId } = requireSession();
        const row = await updateWorkspaceAiPrompt(token, workspaceId, promptId, patch);
        setItems((prev) => prev.map((p) => (p.id === promptId ? row : p)));
        return row;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update prompt.";
        setError(msg);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const remove = useCallback(async (promptId: string) => {
    setSaving(true);
    setError(null);
    try {
      const { token, workspaceId } = requireSession();
      await deleteWorkspaceAiPrompt(token, workspaceId, promptId);
      setItems((prev) => prev.filter((p) => p.id !== promptId));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete prompt.";
      setError(msg);
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    saving,
    reload,
    create,
    update,
    remove,
  };
}
