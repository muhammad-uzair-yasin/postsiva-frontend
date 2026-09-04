"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { ContentManagerChannelFilter } from "../_types/contentManagerTypes";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import {
  contentManagerChannelFilterLabel,
  contentManagerFilterToPlatformId,
} from "../_utils/contentManagerChannelFilterUi";

interface ContentManagerChannelDropdownMenuProps {
  channel: ContentManagerChannelFilter;
  visibleFilters: ContentManagerChannelFilter[];
  labelsByFilter: Partial<Record<ContentManagerChannelFilter, string>>;
  isLoading: boolean;
  error: string | null;
  onSelect: (c: ContentManagerChannelFilter) => void;
}

export function ContentManagerChannelDropdownMenu({
  channel,
  visibleFilters,
  labelsByFilter,
  isLoading,
  error,
  onSelect,
}: ContentManagerChannelDropdownMenuProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div
      className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-xl border border-outline-variant/20 bg-surface-container-high py-1 shadow-2xl"
      role="listbox"
      aria-label={t("content.channelFilterAria")}
    >
      {error ? (
        <div className="px-4 py-2 text-xs font-medium text-error">
          {error}
        </div>
      ) : null}
      {visibleFilters.map((c) => {
        const platformId = contentManagerFilterToPlatformId(c);
        const optionLabel =
          labelsByFilter[c] ?? contentManagerChannelFilterLabel(c);
        return (
          <button
            key={c}
            type="button"
            role="option"
            aria-selected={channel === c}
            onClick={() => {
              onSelect(c);
            }}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
              channel === c
                ? "bg-primary-container/25 text-primary"
                : "text-on-surface hover:bg-surface-container"
            }`}
          >
            {platformId ? (
              <SocialPlatformIcon
                platform={platformId}
                className="h-5 w-5 shrink-0"
              />
            ) : (
              <span className="material-symbols-outlined text-lg text-secondary">
                all_inclusive
              </span>
            )}
            <span className="flex-1">
              {isLoading ? contentManagerChannelFilterLabel(c) : optionLabel}
            </span>
            {channel === c ? (
              <span
                className="material-symbols-outlined text-lg text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

