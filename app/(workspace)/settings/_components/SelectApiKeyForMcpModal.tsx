"use client";

import { useEffect, type ReactElement } from "react";

import type { WorkspaceAPIKeyListItem } from "@/lib/settings/workspaceApiKeysApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

type SelectApiKeyForMcpModalProps = {
  open: boolean;
  keys: WorkspaceAPIKeyListItem[];
  busy: boolean;
  onSelect: (keyId: string) => void;
  onCancel: () => void;
};

export function SelectApiKeyForMcpModal({
  open,
  keys,
  busy,
  onSelect,
  onCancel,
}: SelectApiKeyForMcpModalProps): ReactElement | null {
  const { t } = useTranslations();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcp-pick-key-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="mcp-pick-key-title" className="text-base font-bold text-on-surface">
          {t("settings.mcpPickApiKeyTitle")}
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">{t("settings.mcpPickApiKeyHint")}</p>
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {keys.map((k) => {
            const label = (k.name || "").trim() || k.key_prefix;
            return (
              <li key={k.id}>
                <button
                  type="button"
                  disabled={busy}
                  className="flex w-full flex-col rounded-xl border border-outline-variant/15 bg-surface-container-low px-3 py-2 text-left disabled:opacity-60"
                  onClick={() => onSelect(k.id)}
                >
                  <span className="text-sm font-bold text-on-surface">{label}</span>
                  <span className="text-xs text-on-surface-variant">{k.key_prefix}…</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="mt-4 text-xs font-bold text-on-surface-variant"
          onClick={onCancel}
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
