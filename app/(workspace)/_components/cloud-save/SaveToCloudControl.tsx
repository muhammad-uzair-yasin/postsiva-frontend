"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudExportSource, CloudProvider } from "@/lib/social/cloudStorageApi";
import { downloadToDevice } from "@/lib/social/downloadToDevice";

import { CloudDestinationPicker } from "./CloudDestinationPicker";
import { SaveToCloudMenu } from "./SaveToCloudMenu";
import { useSaveToCloud } from "./useSaveToCloud";

/**
 * Self-contained "Save a copy to cloud" control: a corner trigger button that
 * opens the provider menu and, for OneDrive/Dropbox, the folder picker. Reusable
 * from Postsiva media tiles and stock cards. The source asset is never mutated.
 */
export function SaveToCloudControl({
  source,
  variant = "corner",
  cornerClassName = "absolute right-2 top-2 z-[25]",
}: {
  source: CloudExportSource;
  /** "corner" = absolute icon button for media tiles; "inline" = full-width button. */
  variant?: "corner" | "inline";
  /** Wrapper positioning for the corner variant (override to avoid overlaps). */
  cornerClassName?: string;
}): ReactElement {
  const { t } = useTranslations();
  const {
    connected,
    loadingConnections,
    connectionsError,
    status,
    result,
    loadConnections,
    save,
    reset,
  } = useSaveToCloud(source);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [pickerProvider, setPickerProvider] = useState<CloudProvider | null>(null);

  useEffect(() => {
    if (result?.status !== "success") {
      return;
    }
    const id = window.setTimeout(() => {
      reset();
    }, 4000);
    return () => {
      window.clearTimeout(id);
    };
  }, [result, reset]);

  const openMenu = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    reset();
    void loadConnections();
    setAnchorRect(buttonRef.current?.getBoundingClientRect() ?? null);
    setMenuOpen(true);
  };

  const handlePick = (provider: CloudProvider): void => {
    setMenuOpen(false);
    if (provider === "google_drive") {
      void save(provider);
      return;
    }
    setPickerProvider(provider);
  };

  const handleSaveLocal = (): void => {
    setMenuOpen(false);
    const url = source.downloadUrl ?? source.stockUrl;
    if (url) {
      void downloadToDevice(url, source.filename);
    }
  };

  const handleConfirmFolder = (folderId?: string): void => {
    if (!pickerProvider) {
      return;
    }
    void save(pickerProvider, folderId).finally(() => {
      setPickerProvider(null);
    });
  };

  const saving = status === "saving";
  const success = result?.status === "success";
  const errored = result?.status === "error";
  const mounted = typeof document !== "undefined";

  const triggerClass =
    variant === "inline"
      ? "inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-surface/90 px-2 text-[11px] font-bold text-on-surface shadow-md transition-colors hover:bg-surface"
      : "flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 text-on-surface shadow-lg ring-1 ring-white/20 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-surface-container-high disabled:opacity-100";

  return (
    <div className={variant === "inline" ? "relative w-full" : cornerClassName}>
      <button
        ref={buttonRef}
        type="button"
        disabled={saving}
        onClick={openMenu}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        title={t("cloudSave.buttonAria")}
        aria-label={t("cloudSave.buttonAria")}
        className={triggerClass}
      >
        <span
          className={`material-symbols-outlined ${variant === "inline" ? "text-sm" : "text-base"} ${saving ? "animate-spin" : ""}`}
          aria-hidden
        >
          {saving ? "progress_activity" : success ? "cloud_done" : "cloud_upload"}
        </span>
        {variant === "inline" ? <span>{t("cloudSave.buttonAria")}</span> : null}
      </button>

      {menuOpen ? (
        <SaveToCloudMenu
          anchorRect={anchorRect}
          connected={connected}
          loading={loadingConnections}
          error={connectionsError}
          onPick={handlePick}
          onSaveLocal={handleSaveLocal}
          onClose={() => {
            setMenuOpen(false);
          }}
        />
      ) : null}

      {pickerProvider ? (
        <CloudDestinationPicker
          provider={pickerProvider}
          saving={saving}
          onCancel={() => {
            if (!saving) {
              setPickerProvider(null);
            }
          }}
          onConfirm={handleConfirmFolder}
        />
      ) : null}

      {mounted && (success || errored) && result
        ? createPortal(
            <div
              role="status"
              className={`fixed bottom-4 right-4 z-[1300] max-w-[16rem] rounded-xl px-3 py-2 text-xs font-bold shadow-2xl ${
                success ? "bg-secondary text-on-secondary" : "bg-error text-on-error"
              }`}
            >
              {result.message}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
