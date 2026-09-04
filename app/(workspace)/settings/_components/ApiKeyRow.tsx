"use client";

import { useState, type ReactElement } from "react";

import type { WorkspaceAPIKeyListItem } from "@/lib/settings/workspaceApiKeysApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { copyTextToClipboard } from "../_utils/copyTextToClipboard";

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

interface ApiKeyRowProps {
  item: WorkspaceAPIKeyListItem;
  busy: boolean;
  onDeleteClick: () => void;
  onViewKeyClick: () => void;
}

export function ApiKeyRow(props: ApiKeyRowProps): ReactElement {
  const { t } = useTranslations();
  const { item, busy, onDeleteClick, onViewKeyClick } = props;
  const [prefixCopied, setPrefixCopied] = useState(false);
  const label = item.name?.trim() || t("settings.apiKeysUnnamed");
  const prefixText = `${item.key_prefix}…`;
  return (
    <div className="mb-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4">
      <p className="text-sm font-bold text-on-surface">{label}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
        <span>
          {t("settings.apiKeysPrefixLabel")} {item.key_prefix}… · {item.scope}
        </span>
        <button
          type="button"
          disabled={busy}
          title={t("settings.apiKeysCopyPrefix")}
          aria-label={t("settings.apiKeysCopyPrefix")}
          className="inline-flex items-center gap-1 rounded-md border border-outline-variant/25 bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary transition-colors hover:border-secondary/40 disabled:opacity-50"
          onClick={() => {
            void (async () => {
              const ok = await copyTextToClipboard(prefixText);
              if (ok) {
                setPrefixCopied(true);
                window.setTimeout(() => {
                  setPrefixCopied(false);
                }, 2000);
              }
            })();
          }}
        >
          <span className="material-symbols-outlined text-sm" aria-hidden>
            content_copy
          </span>
          {prefixCopied ? t("common.copied") : t("settings.apiKeysCopyPrefix")}
        </button>
        <button
          type="button"
          disabled={busy}
          title={t("settings.apiKeysViewKey")}
          aria-label={t("settings.apiKeysViewKey")}
          className="inline-flex items-center gap-1 rounded-md border border-outline-variant/25 bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary transition-colors hover:border-secondary/40 disabled:opacity-50"
          onClick={() => {
            onViewKeyClick();
          }}
        >
          <span className="material-symbols-outlined text-sm" aria-hidden>
            key
          </span>
          {t("settings.apiKeysViewKey")}
        </button>
      </div>
      <p className="mt-1 text-[10px] text-on-surface-variant">
        {formatCreatedAt(item.created_at)}
      </p>
      <button
        type="button"
        disabled={busy}
        className="mt-3 w-full rounded-xl border border-error/40 py-2.5 text-xs font-bold text-error disabled:opacity-50"
        onClick={onDeleteClick}
      >
        {t("common.delete")}
      </button>
    </div>
  );
}
