"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  deleteBrandPersona,
  fetchBrandPersona,
  upsertBrandPersona,
} from "@/lib/social/brandPersonaApi";
import type { BrandPersonaData, BrandPersonaMode } from "@/lib/social/brandPersonaTypes";
import { EMPTY_PERSONA_FIELDS } from "@/lib/social/brandPersonaTypes";

export interface UseWorkspaceBrandPersonaResult {
  data: BrandPersonaData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setMode: (mode: BrandPersonaMode) => void;
  setGlobalField: (key: keyof typeof EMPTY_PERSONA_FIELDS, value: string) => void;
  setPlatformField: (
    platform: string,
    key: keyof typeof EMPTY_PERSONA_FIELDS,
    value: string,
  ) => void;
  save: () => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

function emptyData(): BrandPersonaData {
  return {
    mode: "same_for_all",
    global_persona: { ...EMPTY_PERSONA_FIELDS },
    platform_personas: {},
  };
}

export function useWorkspaceBrandPersona(): UseWorkspaceBrandPersonaResult {
  const [data, setData] = useState<BrandPersonaData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setData(emptyData());
        setError("Select a workspace to manage brand persona.");
        return;
      }
      const persona = await fetchBrandPersona(token, ws);
      setData(persona);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load brand persona");
      setData(emptyData());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setMode = useCallback((mode: BrandPersonaMode) => {
    setData((prev) => ({ ...prev, mode }));
  }, []);

  const setGlobalField = useCallback(
    (key: keyof typeof EMPTY_PERSONA_FIELDS, value: string) => {
      setData((prev) => ({
        ...prev,
        global_persona: { ...prev.global_persona, [key]: value },
      }));
    },
    [],
  );

  const setPlatformField = useCallback(
    (platform: string, key: keyof typeof EMPTY_PERSONA_FIELDS, value: string) => {
      setData((prev) => {
        const existing = prev.platform_personas[platform] ?? { ...EMPTY_PERSONA_FIELDS };
        return {
          ...prev,
          platform_personas: {
            ...prev.platform_personas,
            [platform]: { ...existing, [key]: value },
          },
        };
      });
    },
    [],
  );

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        throw new Error("Select a workspace to save brand persona.");
      }
      const saved = await upsertBrandPersona(token, ws, {
        mode: data.mode,
        global_persona: data.global_persona,
        platform_personas: data.platform_personas,
      });
      setData(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save brand persona");
      throw e;
    } finally {
      setSaving(false);
    }
  }, [data]);

  const clear = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        throw new Error("Select a workspace to clear brand persona.");
      }
      await deleteBrandPersona(token, ws);
      setData(emptyData());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear brand persona");
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    data,
    loading,
    saving,
    error,
    setMode,
    setGlobalField,
    setPlatformField,
    save,
    clear,
    refresh,
  };
}
