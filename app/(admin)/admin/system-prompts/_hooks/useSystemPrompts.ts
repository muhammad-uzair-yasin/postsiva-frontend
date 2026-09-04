"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  activateSystemPromptVersion,
  getSystemPrompt,
  listSystemPrompts,
  listSystemPromptVersions,
  resetSystemPrompt,
  saveSystemPromptVersion,
  type SystemPromptDetail,
  type SystemPromptListItem,
  type SystemPromptVersionItem,
} from "@/lib/admin/systemPromptsApi";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Request failed";
}

export function useSystemPrompts() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<SystemPromptListItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<SystemPromptDetail | null>(null);
  const [versions, setVersions] = useState<SystemPromptVersionItem[]>([]);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusError, setStatusError] = useState(false);
  const mounted = useRef(true);

  const reloadList = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listSystemPrompts();
      if (!mounted.current) return;
      setPrompts(res.prompts ?? []);
    } catch (err) {
      if (mounted.current) setLoadError(errorMessage(err));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (key: string) => {
    setDetailLoading(true);
    setStatus(null);
    try {
      const [d, v] = await Promise.all([
        getSystemPrompt(key),
        listSystemPromptVersions(key),
      ]);
      if (!mounted.current) return;
      setDetail(d);
      setDraft(d.body);
      setNote("");
      setVersions(v.versions ?? []);
    } catch (err) {
      if (mounted.current) {
        setStatus(errorMessage(err));
        setStatusError(true);
      }
    } finally {
      if (mounted.current) setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void reloadList();
    return () => {
      mounted.current = false;
    };
  }, [reloadList]);

  const selectPrompt = useCallback(
    (key: string) => {
      setSelectedKey(key);
      void loadDetail(key);
    },
    [loadDetail],
  );

  const refreshSelected = useCallback(async () => {
    if (!selectedKey) return;
    await Promise.all([reloadList(), loadDetail(selectedKey)]);
  }, [selectedKey, reloadList, loadDetail]);

  const save = useCallback(async () => {
    if (!selectedKey) return;
    setBusy(true);
    setStatus(null);
    try {
      await saveSystemPromptVersion(selectedKey, draft, note.trim() || undefined);
      setStatus("Saved as new active version.");
      setStatusError(false);
      await refreshSelected();
    } catch (err) {
      setStatus(errorMessage(err));
      setStatusError(true);
    } finally {
      setBusy(false);
    }
  }, [selectedKey, draft, note, refreshSelected]);

  const activate = useCallback(
    async (versionId: number) => {
      if (!selectedKey) return;
      setBusy(true);
      setStatus(null);
      try {
        await activateSystemPromptVersion(selectedKey, versionId);
        setStatus("Activated version.");
        setStatusError(false);
        await refreshSelected();
      } catch (err) {
        setStatus(errorMessage(err));
        setStatusError(true);
      } finally {
        setBusy(false);
      }
    },
    [selectedKey, refreshSelected],
  );

  const resetToDefault = useCallback(async () => {
    if (!selectedKey) return;
    setBusy(true);
    setStatus(null);
    try {
      await resetSystemPrompt(selectedKey);
      setStatus("Reset to code default.");
      setStatusError(false);
      await refreshSelected();
    } catch (err) {
      setStatus(errorMessage(err));
      setStatusError(true);
    } finally {
      setBusy(false);
    }
  }, [selectedKey, refreshSelected]);

  return {
    loading,
    loadError,
    prompts,
    selectedKey,
    detail,
    versions,
    draft,
    setDraft,
    note,
    setNote,
    detailLoading,
    busy,
    status,
    statusError,
    reloadList,
    selectPrompt,
    save,
    activate,
    resetToDefault,
  };
}
