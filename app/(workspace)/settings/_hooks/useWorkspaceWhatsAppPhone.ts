"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  deleteWorkspacePhone,
  getWorkspacePhone,
  setWorkspacePhone,
  type WorkspacePhoneData,
} from "@/lib/settings/userPhoneApi";

export interface UseWorkspaceWhatsAppPhoneResult {
  phoneData: WorkspacePhoneData | null;
  phoneInput: string;
  setPhoneInput: (v: string) => void;
  loading: boolean;
  error: string | null;
  saving: boolean;
  refresh: () => Promise<void>;
  save: () => Promise<{ ok: boolean; message: string }>;
  remove: () => Promise<{ ok: boolean; message: string }>;
}

export function useWorkspaceWhatsAppPhone(): UseWorkspaceWhatsAppPhoneResult {
  const [phoneData, setPhoneData] = useState<WorkspacePhoneData | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setPhoneData(null);
        setPhoneInput("");
        setError("Select a workspace to manage WhatsApp.");
        return;
      }
      const res = await getWorkspacePhone(token, ws);
      if (!res.success) {
        setError(res.message || "Could not load phone");
        setPhoneData(null);
        setPhoneInput("");
        return;
      }
      const num = res.data?.phone_number?.trim();
      if (num) {
        setPhoneData(res.data ?? null);
        setPhoneInput(num);
      } else {
        setPhoneData(null);
        setPhoneInput("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setPhoneData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      return { ok: false, message: "No workspace selected." };
    }
    setSaving(true);
    setError(null);
    try {
      const res = await setWorkspacePhone(token, ws, phoneInput);
      if (res.success && res.data?.phone_number) {
        setPhoneData(res.data);
        setPhoneInput(res.data.phone_number);
        return { ok: true, message: res.message };
      }
      const msg = res.message || res.error || "Could not save phone";
      setError(msg);
      return { ok: false, message: msg };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setSaving(false);
    }
  }, [phoneInput]);

  const remove = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      return { ok: false, message: "No workspace selected." };
    }
    setSaving(true);
    setError(null);
    try {
      const res = await deleteWorkspacePhone(token, ws);
      if (res.success) {
        setPhoneData(null);
        setPhoneInput("");
        return { ok: true, message: res.message };
      }
      const msg = res.message || res.error || "Could not remove phone";
      setError(msg);
      return { ok: false, message: msg };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Remove failed";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    phoneData,
    phoneInput,
    setPhoneInput,
    loading,
    error,
    saving,
    refresh,
    save,
    remove,
  };
}
