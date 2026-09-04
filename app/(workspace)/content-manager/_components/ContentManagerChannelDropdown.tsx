"use client";

import { useEffect, useRef, useState } from "react";
import type { ContentManagerChannelFilter } from "../_types/contentManagerTypes";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import {
  contentManagerChannelFilterLabel,
  contentManagerFilterToPlatformId,
} from "../_utils/contentManagerChannelFilterUi";
import { getVisibleContentManagerChannelFilters } from "../_utils/getVisibleContentManagerChannelFilters";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { setupContentManagerConnectedChannelLabelSync } from "@/lib/contentManager/setupContentManagerConnectedChannelLabelSync";
import { ContentManagerChannelDropdownMenu } from "./ContentManagerChannelDropdownMenu";

interface ContentManagerChannelDropdownProps {
  channel: ContentManagerChannelFilter;
  onChannelChange: (c: ContentManagerChannelFilter) => void;
}

export function ContentManagerChannelDropdown({
  channel,
  onChannelChange,
}: ContentManagerChannelDropdownProps): React.ReactElement {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labelsByFilter, setLabelsByFilter] = useState<Partial<Record<ContentManagerChannelFilter, string>>>({});
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const workspaceId = getStoredActiveWorkspaceId();
    const token = getStoredAccessToken();
    if (!workspaceId || !token) {
      setIsLoading(false);
      setError(null);
      setLabelsByFilter({});
      return;
    }

    return setupContentManagerConnectedChannelLabelSync(token, workspaceId, {
      onLoading: setIsLoading,
      onError: setError,
      onLabels: (labels) => {
        setLabelsByFilter(labels as Partial<Record<ContentManagerChannelFilter, string>>);
      },
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDoc = (e: MouseEvent): void => {
      if (rootRef.current?.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selectedPlatformId = contentManagerFilterToPlatformId(channel);
  const selectedLabel =
    labelsByFilter[channel] ?? contentManagerChannelFilterLabel(channel);
  const visibleFilters = getVisibleContentManagerChannelFilters(
    isLoading,
    labelsByFilter,
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (channel === "all") {
      return;
    }
    if (!visibleFilters.includes(channel)) {
      onChannelChange("all");
    }
  }, [channel, isLoading, labelsByFilter, onChannelChange]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
      >
        {selectedPlatformId ? (
          <SocialPlatformIcon
            platform={selectedPlatformId}
            className="h-5 w-5 shrink-0"
          />
        ) : (
          <span className="material-symbols-outlined text-secondary">
            filter_list
          </span>
        )}
        <span className="max-w-[140px] truncate sm:max-w-none">
          {isLoading ? t("content.channelLoading") : selectedLabel}
        </span>
        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>
      {open ? (
        <ContentManagerChannelDropdownMenu
          channel={channel}
          visibleFilters={visibleFilters}
          labelsByFilter={labelsByFilter}
          isLoading={isLoading}
          error={error}
          onSelect={(c) => {
            onChannelChange(c);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
