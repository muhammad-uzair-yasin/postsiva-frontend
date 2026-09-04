"use client";

import { useRef, type ReactElement } from "react";

import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import type { AuthUser } from "@/lib/auth/types";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useProfileSettings } from "../_hooks/useProfileSettings";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

function initialsFromUser(user: AuthUser): string {
  const name = user.full_name?.trim() || user.username?.trim() || user.email || "?";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    if (a && b) return (a + b).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ProfileSettingsClient(): ReactElement {
  const { t } = useTranslations();
  const fileRef = useRef<HTMLInputElement>(null);
  const {
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
  } = useProfileSettings();
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();

  const showInitialLoading = isLoading && !user;

  return (
    <SettingsSectionPanel title={t("settings.profile")}>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void uploadPhoto(f);
          e.target.value = "";
        }}
      />

      {showInitialLoading ? (
        <p className="text-sm text-on-surface-variant">{t("settings.profileLoading")}</p>
      ) : null}

      {!showInitialLoading && loadError && !user ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-error">{loadError}</p>
          <button
            type="button"
            className="w-fit rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
            onClick={() => void reload()}
          >
            {t("common.retry")}
          </button>
        </div>
      ) : null}

      {user ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              disabled={photoBusy}
              className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-outline-variant/20 bg-surface-container-low"
              onClick={() => fileRef.current?.click()}
            >
              {user.image_url ? (
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={user.image_url}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-on-surface">
                  {initialsFromUser(user)}
                </span>
              )}
              {photoBusy ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                  …
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="text-sm font-medium text-primary"
              onClick={() => fileRef.current?.click()}
            >
              {t("settings.profileChangePhoto")}
            </button>
            {photoError ? (
              <p className="text-center text-sm text-error">{photoError}</p>
            ) : null}
          </div>

          <label className="block">
            <span className="text-sm font-bold text-on-surface">{t("settings.profileFullName")}</span>
            <input
              className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-on-surface">{t("settings.profileUsername")}</span>
            <input
              className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          {saveError ? <p className="text-sm text-error">{saveError}</p> : null}

          <button
            type="button"
            disabled={saving}
            className="rounded-xl bg-primary-container py-3 text-sm font-bold text-on-primary-container disabled:opacity-50"
            onClick={() => {
              void (async () => {
                const ok = await save();
                if (ok) {
                  showToast(t("settings.profileUpdated"), t("settings.profileUpdatedHint"));
                }
              })();
            }}
          >
            {saving ? t("common.saving") : t("settings.profileSaveChanges")}
          </button>
        </div>
      ) : null}

      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </SettingsSectionPanel>
  );
}
