"use client";

import { useMemo, type ReactElement } from "react";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isPostingSelectableHeaderAccount } from "@/lib/workspace/headerAccountGrouping";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { normalizeLinkedInScheduledPlatformUserId } from "@/lib/workspace/linkedInScheduledPlatformUserId";
import { resolvePostingDestinationFromHeaderAccount } from "@/lib/workspace/resolvePostingDestinationFromHeaderAccount";

interface DraftEditorAccountPickerModalProps {
  readonly open: boolean;
  readonly currentPlatform?: string | null;
  readonly currentPlatformUserId?: string | null;
  readonly onClose: () => void;
  readonly onSelect: (row: WorkspaceHeaderAccountRow) => void;
  readonly disabled?: boolean;
}

function platformUserIdsMatch(
  platform: string,
  a: string,
  b: string,
): boolean {
  if (!a.trim() || !b.trim()) {
    return false;
  }
  if (platform === "linkedin") {
    return (
      normalizeLinkedInScheduledPlatformUserId(a) ===
      normalizeLinkedInScheduledPlatformUserId(b)
    );
  }
  return a.trim() === b.trim();
}

export function DraftEditorAccountPickerModal({
  open,
  currentPlatform,
  currentPlatformUserId,
  onClose,
  onSelect,
  disabled = false,
}: DraftEditorAccountPickerModalProps): ReactElement | null {
  const { t } = useTranslations();
  const { accounts, unifiedProfiles } = useWorkspaceHeaderAccounts();

  const rows = useMemo(
    () => accounts.filter(isPostingSelectableHeaderAccount),
    [accounts],
  );

  const currentPlatformKey = currentPlatform?.trim().toLowerCase() ?? "";
  const currentId = currentPlatformUserId?.trim() ?? "";

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("content.actionClose")}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-editor-account-picker-title"
        className="relative z-[131] flex max-h-[min(70vh,520px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-outline-variant/20 bg-surface shadow-2xl sm:mx-4 sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/10 px-4 py-3">
          <div>
            <h3
              id="draft-editor-account-picker-title"
              className="text-base font-bold text-on-surface"
            >
              {t("content.changeAccountTitle")}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {t("content.changeAccountHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            aria-label={t("content.actionClose")}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </header>
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {rows.map((row) => {
            const dest = resolvePostingDestinationFromHeaderAccount(
              row,
              unifiedProfiles,
            );
            const selected =
              Boolean(currentPlatformKey) &&
              dest.platform === currentPlatformKey &&
              platformUserIdsMatch(
                dest.platform,
                dest.platformUserId,
                currentId,
              );
            return (
              <li key={row.id}>
                <button
                  type="button"
                  disabled={disabled || selected}
                  onClick={() => {
                    onSelect(row);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-container disabled:cursor-default disabled:opacity-60"
                >
                  <SocialPlatformIcon
                    platform={row.iconId}
                    className="h-9 w-9 shrink-0 rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {row.label}
                    </p>
                    <p className="truncate text-xs text-on-surface-variant">
                      {row.hint ?? row.iconId}
                    </p>
                  </div>
                  {selected ? (
                    <span
                      className="material-symbols-outlined text-lg text-primary"
                      aria-hidden
                    >
                      check
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
