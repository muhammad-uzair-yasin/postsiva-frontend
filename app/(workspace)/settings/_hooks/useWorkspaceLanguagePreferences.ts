"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
  getStoredUser,
  getStoredWorkspaces,
  patchStoredWorkspace,
} from "@/lib/auth/session";
import {
  LOCALE_OPTIONS,
  normalizeWorkspaceLocale,
  type WorkspaceLocale,
} from "@/lib/i18n/locales";
import { patchWorkspace } from "@/lib/workspaces/workspaceApi";

export interface UseWorkspaceLanguagePreferencesResult {
  loading: boolean;
  saving: boolean;
  error: string | null;
  selectedLocale: WorkspaceLocale;
  isOwner: boolean;
  setSelectedLocale: (locale: WorkspaceLocale) => void;
  save: () => Promise<void>;
  localeOptions: typeof LOCALE_OPTIONS;
}

export function useWorkspaceLanguagePreferences(): UseWorkspaceLanguagePreferencesResult {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<WorkspaceLocale>("en");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const workspaceId = getStoredActiveWorkspaceId();
    const user = getStoredUser();
    const workspaces = getStoredWorkspaces();
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setSelectedLocale(normalizeWorkspaceLocale(ws.locale));
      setIsOwner(Boolean(user?.id && ws.owner_id === user.id));
    }
    setLoading(false);
  }, []);

  const save = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId) {
      throw new Error("Sign in and select a workspace to save language.");
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await patchWorkspace(token, workspaceId, { locale: selectedLocale });
      patchStoredWorkspace(workspaceId, { locale: updated.locale });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save language.");
      throw e;
    } finally {
      setSaving(false);
    }
  }, [selectedLocale]);

  return {
    loading,
    saving,
    error,
    selectedLocale,
    isOwner,
    setSelectedLocale,
    save,
    localeOptions: LOCALE_OPTIONS,
  };
}
