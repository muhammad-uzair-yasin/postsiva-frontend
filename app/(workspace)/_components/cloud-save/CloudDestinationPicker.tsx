"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  listCloudItems,
  type CloudFileItem,
  type CloudProvider,
} from "@/lib/social/cloudStorageApi";

const subscribe = () => () => undefined;

interface Crumb {
  id?: string;
  name: string;
}

/**
 * Native folder browser for OneDrive / Dropbox. Google Drive uses root-only
 * export and never opens this modal.
 */
export function CloudDestinationPicker({
  provider,
  saving,
  onCancel,
  onConfirm,
}: {
  provider: CloudProvider;
  saving: boolean;
  onCancel: () => void;
  /** folderId is undefined at the drive root. */
  onConfirm: (folderId?: string) => void;
}): ReactElement | null {
  const { t } = useTranslations();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [path, setPath] = useState<Crumb[]>([{ name: t("cloudSave.pickerRoot") }]);
  const [folders, setFolders] = useState<CloudFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = path[path.length - 1];
  const providerLabel = t(
    `cloudSave.${provider === "google_drive" ? "googleDrive" : provider}`,
  );

  const loadFolder = useCallback(
    async (folderId?: string): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setError(t("cloudSave.signInFirst"));
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await listCloudItems(token, workspaceId, provider, { folderId });
        setFolders(res.items.filter((i) => i.is_folder));
      } catch (e) {
        setError(e instanceof Error ? e.message : t("cloudSave.foldersError"));
      } finally {
        setLoading(false);
      }
    },
    [provider, t],
  );

  useEffect(() => {
    void loadFolder(undefined);
  }, [loadFolder]);

  const openFolder = (folder: CloudFileItem): void => {
    setPath((p) => [...p, { id: folder.file_id, name: folder.name }]);
    void loadFolder(folder.file_id);
  };

  const goToCrumb = (index: number): void => {
    const target = path[index];
    setPath((p) => p.slice(0, index + 1));
    void loadFolder(target.id);
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[1100] bg-black/55">
      <button
        type="button"
        aria-label={t("cloudSave.cancel")}
        className="absolute inset-0 cursor-default"
        onClick={saving ? undefined : onCancel}
      />
      <div className="pointer-events-none fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-5">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${t("cloudSave.pickerTitle")} — ${providerLabel}`}
          className="pointer-events-auto relative z-10 flex max-h-[70vh] w-full flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
        >
          <h2 className="font-headline text-lg font-bold text-on-surface">
            {t("cloudSave.pickerTitle")} · {providerLabel}
          </h2>

          <nav
            aria-label={t("cloudSave.pickerTitle")}
            className="mt-2 flex flex-wrap items-center gap-1 text-xs text-on-surface-variant"
          >
            {path.map((c, i) => (
              <span key={`${c.id ?? "root"}-${i}`} className="flex items-center gap-1">
                {i > 0 ? <span aria-hidden>/</span> : null}
                <button
                  type="button"
                  disabled={i === path.length - 1 || loading || saving}
                  onClick={() => {
                    goToCrumb(i);
                  }}
                  className="max-w-[10rem] truncate rounded px-1 py-0.5 font-semibold hover:text-on-surface disabled:font-bold disabled:text-on-surface"
                >
                  {c.name}
                </button>
              </span>
            ))}
          </nav>

          <div className="mt-3 min-h-[8rem] flex-1 overflow-y-auto rounded-xl border border-outline-variant/15 bg-surface-container p-1">
            {loading ? (
              <p className="px-3 py-6 text-center text-sm text-on-surface-variant">
                {t("cloudSave.loadingFolders")}
              </p>
            ) : error ? (
              <p className="px-3 py-6 text-center text-sm font-semibold text-error" role="alert">
                {error}
              </p>
            ) : folders.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-on-surface-variant">
                {t("cloudSave.noFolders")}
              </p>
            ) : (
              folders.map((f) => (
                <button
                  key={f.file_id}
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    openFolder(f);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-on-surface hover:bg-surface-container-highest disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg text-primary" aria-hidden>
                    folder
                  </span>
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/60" aria-hidden>
                    chevron_right
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={onCancel}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:opacity-90 disabled:opacity-50"
            >
              {t("cloudSave.cancel")}
            </button>
            <button
              type="button"
              disabled={saving || loading}
              onClick={() => {
                onConfirm(current.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <span className="material-symbols-outlined animate-spin text-base" aria-hidden>
                  progress_activity
                </span>
              ) : null}
              {saving ? t("cloudSave.saving") : t("cloudSave.saveHere")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
