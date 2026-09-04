"use client";

import { useCallback, useEffect, useState } from "react";

import type { AuthUser } from "@/lib/auth/types";
import {
  fetchCurrentUser,
  updateProfile,
  uploadProfileImage,
} from "@/lib/auth/authApi";
import { getStoredAccessToken, getStoredUser, setStoredUser } from "@/lib/auth/session";

export interface UseProfileSettingsResult {
  user: AuthUser | null;
  fullName: string;
  setFullName: (v: string) => void;
  username: string;
  setUsername: (v: string) => void;
  isLoading: boolean;
  loadError: string | null;
  saveError: string | null;
  saving: boolean;
  photoBusy: boolean;
  photoError: string | null;
  reload: () => Promise<void>;
  save: () => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<void>;
}

export function useProfileSettings(): UseProfileSettingsResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const applyUserToForm = useCallback((u: AuthUser) => {
    setUser(u);
    setFullName(u.full_name?.trim() ?? "");
    setUsername(u.username?.trim() ?? "");
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const token = getStoredAccessToken();
      if (!token) {
        setLoadError("Not signed in");
        return;
      }
      const cached = getStoredUser();
      if (cached) {
        applyUserToForm(cached);
      }
      try {
        const fresh = await fetchCurrentUser(token);
        setStoredUser(fresh);
        applyUserToForm(fresh);
      } catch (e) {
        if (!cached) {
          setLoadError(e instanceof Error ? e.message : "Could not load profile");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [applyUserToForm]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async (): Promise<boolean> => {
    const token = getStoredAccessToken();
    if (!token) {
      return false;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const trimmedUser = username.replace(/^@+/, "").trim();
      const updated = await updateProfile(token, {
        full_name: fullName.trim() || undefined,
        username: trimmedUser || undefined,
      });
      setStoredUser(updated);
      applyUserToForm(updated);
      return true;
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }, [applyUserToForm, fullName, username]);

  const uploadPhoto = useCallback(
    async (file: File) => {
      const token = getStoredAccessToken();
      if (!token) {
        return;
      }
      setPhotoError(null);
      setPhotoBusy(true);
      try {
        const updated = await uploadProfileImage(token, file);
        setStoredUser(updated);
        applyUserToForm(updated);
      } catch (e) {
        setPhotoError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setPhotoBusy(false);
      }
    },
    [applyUserToForm],
  );

  return {
    user,
    fullName,
    setFullName,
    username,
    setUsername,
    isLoading,
    loadError,
    saveError,
    saving,
    photoBusy,
    photoError,
    reload,
    save,
    uploadPhoto,
  };
}
