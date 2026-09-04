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

export interface UseWorkspaceAiOutputLanguageResult {
  loading: boolean;
  saving: boolean;
  error: string | null;
  selectedLocale: WorkspaceLocale;
  /** True when dropdown differs from last saved workspace value. */
  isDirty: boolean;
  isOwner: boolean;
  setSelectedLocale: (locale: WorkspaceLocale) => void;
  save: () => Promise<void>;
  localeOptions: typeof LOCALE_OPTIONS;
}

function readAiOutputLocaleFromStorage(): WorkspaceLocale {
  const workspaceId = getStoredActiveWorkspaceId();
  const ws = getStoredWorkspaces().find((w) => w.id === workspaceId);
  if (!ws) {
    return "en";
  }
  const raw = ws.ai_output_locale ?? ws.locale;
  return normalizeWorkspaceLocale(raw ?? "en");
}

export function useWorkspaceAiOutputLanguage(): UseWorkspaceAiOutputLanguageResult {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<WorkspaceLocale>("en");
  const [savedLocale, setSavedLocale] = useState<WorkspaceLocale>("en");
  const [isOwner, setIsOwner] = useState(false);

  const refreshFromStorage = useCallback((): void => {
    const workspaceId = getStoredActiveWorkspaceId();
    const user = getStoredUser();
    const workspaces = getStoredWorkspaces();
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      const locale = readAiOutputLocaleFromStorage();
      setSelectedLocale(locale);
      setSavedLocale(locale);
      setIsOwner(Boolean(user?.id && ws.owner_id === user.id));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshFromStorage();
    const onChange = (): void => {
      refreshFromStorage();
    };
    window.addEventListener("postsiva_workspaces_changed", onChange);
    window.addEventListener("postsiva_active_workspace_changed", onChange);
    return () => {
      window.removeEventListener("postsiva_workspaces_changed", onChange);
      window.removeEventListener("postsiva_active_workspace_changed", onChange);
    };
  }, [refreshFromStorage]);

  const save = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId) {
      throw new Error("Sign in and select a workspace to save AI output language.");
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await patchWorkspace(token, workspaceId, {
        ai_output_locale: selectedLocale,
      });
      patchStoredWorkspace(workspaceId, {
        ai_output_locale: updated.ai_output_locale,
      });
      setSavedLocale(selectedLocale);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save AI output language.");
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
    isDirty: selectedLocale !== savedLocale,
    isOwner,
    setSelectedLocale,
    save,
    localeOptions: LOCALE_OPTIONS,
  };
}
