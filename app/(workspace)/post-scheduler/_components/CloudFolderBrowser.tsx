"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudFileItem, CloudProvider } from "@/lib/social/cloudStorageApi";

import { useCloudBrowser } from "../_hooks/useCloudBrowser";
import type { CloudImportFile } from "../_hooks/useCloudImport";

const subscribeToClient = () => () => undefined;

function formatBytes(size: number | null | undefined): string {
  if (!size || size <= 0) {
    return "";
  }
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

export interface CloudFolderBrowserProps {
  provider: CloudProvider;
  providerLabel: string;
  visible: boolean;
  multiSelect?: boolean;
  confirmLabel: string;
  busy?: boolean;
  statusLabel?: string | null;
  importError?: string | null;
  reconnectRequired?: boolean;
  onReconnect?: () => void;
  onClose: () => void;
  onConfirm: (files: CloudImportFile[]) => void;
}

/**
 * Native OneDrive/Dropbox folder browser: breadcrumb navigation, debounced
 * search, folders-first tiles, "Load more" paging, single/multi select, and a
 * focus-trapped modal. Google Drive keeps using its Picker instead.
 */
export function CloudFolderBrowser(props: CloudFolderBrowserProps): ReactElement | null {
  const { t } = useTranslations();
  const {
    provider,
    providerLabel,
    visible,
    multiSelect = true,
    confirmLabel,
    busy = false,
    statusLabel,
    importError,
    reconnectRequired = false,
    onReconnect,
    onClose,
    onConfirm,
  } = props;
  const browser = useCloudBrowser(provider, visible);
  const [selected, setSelected] = useState<Map<string, CloudImportFile>>(new Map());
  const dialogRef = useRef<HTMLDivElement>(null);

  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (visible && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [visible]);

  const toggleSelect = useCallback(
    (item: CloudFileItem): void => {
      setSelected((prev) => {
        const next = new Map(multiSelect ? prev : []);
        if (prev.has(item.file_id)) {
          next.delete(item.file_id);
        } else {
          next.set(item.file_id, { fileId: item.file_id, name: item.name });
        }
        return next;
      });
    },
    [multiSelect],
  );

  const selectedList = useMemo(() => Array.from(selected.values()), [selected]);

  if (!visible || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[1300] bg-black/60">
      <button
        type="button"
        aria-label={t("common.dismiss")}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-5">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("cloudStorage.browserTitle", { provider: providerLabel })}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="pointer-events-auto flex max-h-[82vh] flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-high shadow-2xl outline-none"
        >
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant/15 px-5 py-4">
            <h2 className="truncate text-base font-bold text-on-surface">
              {t("cloudStorage.browserTitle", { provider: providerLabel })}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.dismiss")}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                close
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-3 border-b border-outline-variant/15 px-5 py-3">
            <nav aria-label={t("cloudStorage.breadcrumbLabel")} className="flex flex-wrap items-center gap-1 text-xs">
              {browser.crumbs.map((crumb, index) => (
                <span key={`${crumb.id ?? "root"}-${index}`} className="flex items-center gap-1">
                  {index > 0 ? (
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant/60" aria-hidden>
                      chevron_right
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => browser.navigateTo(index)}
                    disabled={index === browser.crumbs.length - 1}
                    className="rounded px-1 py-0.5 font-semibold text-on-surface-variant hover:text-on-surface disabled:text-on-surface disabled:hover:text-on-surface"
                  >
                    {index === 0 ? t("cloudStorage.rootFolder") : crumb.name}
                  </button>
                </span>
              ))}
            </nav>
            <label className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-2 text-[18px] text-on-surface-variant/60" aria-hidden>
                search
              </span>
              <input
                type="search"
                value={browser.search}
                onChange={(event) => browser.setSearch(event.target.value)}
                placeholder={t("cloudStorage.searchPlaceholder")}
                aria-label={t("cloudStorage.searchPlaceholder")}
                className="w-full rounded-lg border border-outline-variant/25 bg-surface-container px-8 py-2 text-sm text-on-surface outline-none focus:border-secondary/50"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {browser.error ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm text-error" role="alert">
                  {browser.error}
                </p>
                {reconnectRequired && onReconnect ? (
                  <button
                    type="button"
                    onClick={onReconnect}
                    className="rounded-lg border border-error/35 px-3 py-1.5 text-xs font-bold text-error hover:bg-error/10"
                  >
                    {t("cloudStorage.reconnect")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={browser.reload}
                    className="rounded-lg border border-outline-variant/35 px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container"
                  >
                    {t("cloudStorage.tryAgain")}
                  </button>
                )}
              </div>
            ) : browser.loading ? (
              <div className="grid place-items-center py-16">
                <span className="material-symbols-outlined animate-spin text-3xl text-secondary/50" aria-hidden>
                  progress_activity
                </span>
              </div>
            ) : browser.items.length === 0 ? (
              <p className="py-16 text-center text-sm text-on-surface-variant">
                {t("cloudStorage.emptyFolder")}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {browser.items.map((item) => {
                  const isSelected = selected.has(item.file_id);
                  const sizeLabel = formatBytes(item.size);
                  return (
                    <button
                      key={item.file_id}
                      type="button"
                      aria-pressed={item.is_folder ? undefined : isSelected}
                      onClick={() =>
                        item.is_folder ? browser.openFolder(item) : toggleSelect(item)
                      }
                      className={`group flex flex-col overflow-hidden rounded-xl border text-left transition ${
                        isSelected
                          ? "border-secondary bg-secondary/10 ring-1 ring-secondary/40"
                          : "border-outline-variant/20 bg-surface hover:border-secondary/45"
                      }`}
                    >
                      <div className="relative grid aspect-square place-items-center bg-surface-container text-secondary">
                        {item.is_folder ? (
                          <span className="material-symbols-outlined text-4xl" aria-hidden>
                            folder
                          </span>
                        ) : item.thumbnail_url && item.mime_type?.startsWith("video/") ? (
                          <video
                            src={item.thumbnail_url}
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                            aria-label={item.name}
                          />
                        ) : item.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- remote cloud thumbnail URL
                          <img
                            src={item.thumbnail_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-4xl" aria-hidden>
                            {item.mime_type?.startsWith("video/") ? "videocam" : "image"}
                          </span>
                        )}
                        {!item.is_folder && isSelected ? (
                          <span className="material-symbols-outlined absolute right-1.5 top-1.5 rounded-full bg-secondary text-[18px] text-on-secondary" aria-hidden>
                            check_circle
                          </span>
                        ) : null}
                      </div>
                      <div className="px-2 py-1.5">
                        <p className="truncate text-xs font-medium text-on-surface">{item.name}</p>
                        {sizeLabel ? (
                          <p className="text-[10px] text-on-surface-variant/70">{sizeLabel}</p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {browser.hasMore && !browser.loading && !browser.error ? (
              <div className="mt-4 grid place-items-center">
                <button
                  type="button"
                  onClick={browser.loadMore}
                  disabled={browser.loadingMore}
                  className="rounded-lg border border-outline-variant/30 px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-60"
                >
                  {browser.loadingMore ? t("cloudStorage.importing") : t("cloudStorage.loadMore")}
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-outline-variant/15 px-5 py-3">
            <p className="truncate text-xs text-on-surface-variant" role="status">
              {busy
                ? (statusLabel ?? t("cloudStorage.importing"))
                : importError
                  ? t("cloudStorage.importFailed")
                  : t("cloudStorage.selectedCount", { count: String(selectedList.length) })}
            </p>
            <button
              type="button"
              onClick={() => onConfirm(selectedList)}
              disabled={busy || selectedList.length === 0}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-md transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? (
                <span className="material-symbols-outlined animate-spin text-base" aria-hidden>
                  progress_activity
                </span>
              ) : null}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
