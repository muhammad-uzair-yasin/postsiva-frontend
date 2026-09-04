"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  fetchWorkspaceEmailNotifications,
  saveWorkspaceEmailNotifications,
  type WorkspaceEmailNotifications,
  type WorkspaceEmailNotificationValues,
} from "@/lib/settings/workspaceEmailNotificationsApi";

export function useWorkspaceEmailNotifications() {
  const [settings, setSettings] = useState<WorkspaceEmailNotifications | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token || !workspaceId) {
      setError("Select a workspace to manage notifications.");
      setLoading(false);
      return;
    }
    void fetchWorkspaceEmailNotifications(token, workspaceId)
      .then(setSettings)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load notifications."))
      .finally(() => setLoading(false));
  }, []);

  const setValue = useCallback((key: keyof WorkspaceEmailNotificationValues, value: boolean) => {
    setSettings((current) => current ? { ...current, [key]: value } : current);
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token || !workspaceId || !settings) return false;
    const values: WorkspaceEmailNotificationValues = {
      draft_saved: settings.draft_saved,
      post_scheduled: settings.post_scheduled,
      post_published: settings.post_published,
      scheduled_post_failed: settings.scheduled_post_failed,
      account_connected: settings.account_connected,
      account_disconnected: settings.account_disconnected,
      lead_detected: settings.lead_detected,
    };
    setSaving(true);
    setError(null);
    try {
      setSettings(await saveWorkspaceEmailNotifications(token, workspaceId, values));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save notifications.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  return { settings, loading, saving, error, setValue, save };
}
