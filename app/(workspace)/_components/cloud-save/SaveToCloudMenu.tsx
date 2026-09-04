"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudProvider } from "@/lib/social/cloudStorageApi";

const PROVIDERS: { id: CloudProvider; key: string; icon: string }[] = [
  { id: "google_drive", key: "googleDrive", icon: "add_to_drive" },
  { id: "onedrive", key: "onedrive", icon: "cloud" },
  { id: "dropbox", key: "dropbox", icon: "inventory_2" },
];

const CONNECTIONS_HREF = "/settings/connections";
const subscribe = () => () => undefined;

export function SaveToCloudMenu({
  anchorRect,
  connected,
  loading,
  error,
  onPick,
  onSaveLocal,
  onClose,
}: {
  /** Trigger button rect (viewport coords) used to position the portal popover. */
  anchorRect: DOMRect | null;
  /** Connected providers, or null while unknown (still loading). */
  connected: Set<CloudProvider> | null;
  loading: boolean;
  error: string | null;
  /** Fired for a connected provider: google_drive saves to root, others open the folder picker. */
  onPick: (provider: CloudProvider) => void;
  /** Download a copy to the user's device. */
  onSaveLocal: () => void;
  onClose: () => void;
}): ReactElement | null {
  const { t } = useTranslations();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    const onPointer = (e: PointerEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    ref.current?.querySelector<HTMLElement>("[data-first]")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [onClose]);

  if (!mounted || !anchorRect) {
    return null;
  }

  const WIDTH = 224;
  const left = Math.max(8, Math.min(anchorRect.right - WIDTH, window.innerWidth - WIDTH - 8));
  const top = anchorRect.bottom + 4;

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label={t("cloudSave.menuTitle")}
      style={{ position: "fixed", top, left, width: WIDTH }}
      className="z-[1200] overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-high p-1 text-left shadow-2xl"
    >
      <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/80">
        {t("cloudSave.menuTitle")}
      </p>
      <button
        type="button"
        role="menuitem"
        data-first=""
        onClick={onSaveLocal}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
      >
        <span className="material-symbols-outlined text-lg text-primary" aria-hidden>
          download
        </span>
        <span className="truncate">{t("cloudSave.saveLocal")}</span>
      </button>
      <div className="my-1 border-t border-outline-variant/15" />
      {PROVIDERS.map((p, i) => {
        const isConnected = connected?.has(p.id) ?? false;
        const providerLabel = t(`cloudSave.${p.key}`);
        if (!isConnected) {
          return (
            <div key={p.id} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5">
              <span className="material-symbols-outlined text-lg text-on-surface-variant/60" aria-hidden>
                {p.icon}
              </span>
              <span className="flex-1 truncate text-sm text-on-surface-variant/70">
                {providerLabel}
              </span>
              <Link
                data-first={i === 0 ? "" : undefined}
                href={CONNECTIONS_HREF}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-primary hover:underline"
                title={t("cloudSave.connectFirstHint")}
              >
                {t("cloudSave.connectFirst")}
              </Link>
            </div>
          );
        }
        return (
          <button
            key={p.id}
            type="button"
            role="menuitem"
            data-first={i === 0 ? "" : undefined}
            disabled={loading}
            onClick={() => {
              onPick(p.id);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg text-primary" aria-hidden>
              {p.icon}
            </span>
            <span className="truncate">{providerLabel}</span>
          </button>
        );
      })}
      {loading ? (
        <p className="px-2.5 py-1.5 text-[11px] text-on-surface-variant/70">
          {t("cloudSave.loadingFolders")}
        </p>
      ) : null}
      {error ? (
        <p className="px-2.5 py-1.5 text-[11px] font-semibold text-error" role="alert">
          {error}
        </p>
      ) : null}
      <p className="px-2.5 pb-1 pt-1.5 text-[10px] leading-snug text-on-surface-variant/60">
        {t("cloudSave.driveRootNote")}
      </p>
    </div>,
    document.body,
  );
}
