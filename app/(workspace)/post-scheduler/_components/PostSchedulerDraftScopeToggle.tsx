"use client";

import type { ComposerDraftScope } from "../_types/composerDraftTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PostSchedulerDraftScopeToggleProps {
  readonly draftScope: ComposerDraftScope;
  readonly onChange: (scope: ComposerDraftScope) => void;
  readonly disablePerPostOption?: boolean;
  /** Tighter control height (composer modal). */
  readonly compact?: boolean;
}

/** Same labels as mobile: Same for all / Per channel. */
export function PostSchedulerDraftScopeToggle({
  draftScope,
  onChange,
  disablePerPostOption = false,
  compact = false,
}: PostSchedulerDraftScopeToggleProps): React.ReactElement {
  const { t } = useTranslations();
  const btnMinH = compact ? "min-h-8" : "min-h-14";

  return (
    <div
      className={`grid grid-cols-2 gap-1 rounded-xl border border-outline-variant/20 bg-surface-container-low ${
        compact ? "p-0.5" : "p-1"
      }`}
      role="group"
      aria-label={t("postScheduler.composer.draftScopeAria")}
    >
      <button
        type="button"
        aria-pressed={draftScope === "all_channels"}
        className={`flex ${btnMinH} min-w-0 items-center justify-center rounded-lg px-2 text-center ${compact ? "text-[11px]" : "text-xs"} font-bold transition-colors ${
          draftScope === "all_channels"
            ? "bg-primary-container text-on-primary-container"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
        onClick={() => {
          onChange("all_channels");
        }}
      >
        {t("postScheduler.composer.sameForAll")}
      </button>
      <button
        type="button"
        aria-pressed={draftScope === "per_channel"}
        disabled={disablePerPostOption}
        className={`flex ${btnMinH} min-w-0 items-center justify-center rounded-lg px-2 text-center ${compact ? "text-[11px]" : "text-xs"} font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          draftScope === "per_channel"
            ? "bg-primary-container text-on-primary-container"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
        onClick={() => {
          onChange("per_channel");
        }}
      >
        {t("postScheduler.composer.perPlatform")}
      </button>
    </div>
  );
}
