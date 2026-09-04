"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { SOCIAL_PLATFORM_ICON_SRC } from "@/lib/social/socialPlatformIconSrc";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  activeComposerChannelSection,
  composerChannelSectionForHeaderAccount,
  withOppositeSectionDisabled,
} from "@/lib/post-composer/composerChannelSections";

import { WorkspaceAccountDropdownMenu } from "../../_components/WorkspaceAccountDropdownMenu";
import { useWorkspacePlatformsModal } from "../../_components/WorkspacePlatformsModalProvider";
import { usePostSchedulerComposerChannels } from "../_context/PostSchedulerComposerChannelsContext";
import { usePostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { popoverPositionUnderTrigger } from "../_utils/postSchedulerChannelPopoverPosition";
import type { ComposerChannelAccount } from "../_data/postSchedulerComposerChannelAccounts";
import { PostSchedulerChannelPlatformBadge } from "./PostSchedulerChannelPlatformBadge";

/** Compact selected-channel tiles keep large multi-channel sets from squeezing the editor. */
const CHANNEL_TILE =
  "relative box-border flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-low";

function platformLabel(
  platform: string,
  t: (key: string) => string,
): string {
  switch (platform) {
    case "x":
      return t("postScheduler.preview.tabX");
    case "tiktok":
      return t("postScheduler.preview.tabTiktok");
    case "youtube":
      return t("postScheduler.preview.tabYoutube");
    case "linkedin":
      return t("postScheduler.preview.tabLinkedin");
    case "pinterest":
      return t("postScheduler.preview.tabPinterest");
    case "bluesky":
      return t("postScheduler.preview.tabBluesky");
    case "mastodon":
      return t("postScheduler.preview.tabMastodon");
    case "instagram":
      return t("postScheduler.preview.tabInstagram");
    case "facebook":
      return t("postScheduler.preview.tabFacebook");
    case "threads":
      return t("postScheduler.preview.tabThreads");
    case "wordpress":
      return t("postScheduler.composer.wordpressSite");
    default:
      return t("postScheduler.platforms.platform");
  }
}

function ChannelTile({
  acc,
  onRemove,
  t,
}: {
  readonly acc: ComposerChannelAccount;
  readonly onRemove: (id: string) => void;
  readonly t: (key: string, values?: Record<string, string>) => string;
}): React.ReactElement {
  const hoverLabel = `${platformLabel(acc.platform, t)} · ${acc.displayName}`;
  return (
    <div
      className={`group ${CHANNEL_TILE}`}
      title={hoverLabel}
      aria-label={hoverLabel}
    >
      {acc.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={acc.avatarUrl}
          alt=""
          onError={(event) => {
            const img = event.currentTarget;
            img.onerror = null;
            img.src = SOCIAL_PLATFORM_ICON_SRC[acc.platform];
            img.className =
              "h-full w-full object-contain bg-surface-container p-1";
          }}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface-container p-1.5">
          <SocialPlatformIcon
            platform={acc.platform}
            className="h-8 w-8"
            alt=""
          />
        </div>
      )}
      <div className="absolute bottom-0 right-0">
        <PostSchedulerChannelPlatformBadge
          platform={acc.platform}
          className="h-4 w-4 rounded-[0.25rem] [&_img]:h-3 [&_img]:w-3"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          onRemove(acc.id);
        }}
        aria-label={t("postScheduler.channels.removeChannel", {
          name: acc.displayName,
        })}
        className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded bg-surface-container-highest/90 text-on-surface opacity-100 shadow-sm ring-1 ring-outline-variant/25 transition-opacity hover:bg-error-container hover:text-on-error-container md:opacity-0 md:group-hover:opacity-100"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  );
}

export function PostSchedulerChannelPicker(): React.ReactElement {
  const { t } = useTranslations();
  const {
    selectedIds,
    selectedAccounts,
    headerAccounts,
    isLoadingProfiles,
    profilesError,
    toggleAccountId,
    removeAccountId,
  } = usePostSchedulerComposerChannels();

  const { openPlatformsForConnect } = useWorkspacePlatformsModal();
  const { postFormat, contentMode } = usePostSchedulerComposerDraft();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const metaShortFormOnly =
    (postFormat === "reel" || postFormat === "story") && contentMode === "social";

  const headerById = useMemo(() => {
    const map = new Map<string, (typeof headerAccounts)[number]>();
    for (const row of headerAccounts) {
      map.set(row.id, row);
    }
    return map;
  }, [headerAccounts]);

  const activeSection = useMemo(
    () => activeComposerChannelSection(selectedIds, (id) => headerById.get(id)),
    [headerById, selectedIds],
  );

  const sectionLabel = useMemo(() => {
    if (activeSection === "blog") {
      return t("postScheduler.channels.blogSection");
    }
    if (activeSection === "social") {
      return t("postScheduler.channels.socialSection");
    }
    return t("postScheduler.composer.channels");
  }, [activeSection, t]);

  const pickerAccounts = useMemo(() => {
    let rows = withOppositeSectionDisabled(headerAccounts, activeSection, {
      socialBlocked: t("postScheduler.channels.onlySelectBlog"),
      blogBlocked: t("postScheduler.channels.onlySelectSocial"),
    });
    if (metaShortFormOnly && activeSection !== "blog") {
      rows = rows.map((acc) =>
        acc.iconId === "facebook" || acc.iconId === "instagram"
          ? acc
          : composerChannelSectionForHeaderAccount(acc) === "social"
            ? {
                ...acc,
                disabled: true,
                disabledMessage: t("postScheduler.composer.formatMetaOnly"),
              }
            : acc,
      );
    }
    return rows;
  }, [activeSection, headerAccounts, metaShortFormOnly, t]);

  const onConnectChannels = useCallback(() => {
    openPlatformsForConnect();
  }, [openPlatformsForConnect]);

  useLayoutEffect(() => {
    if (!pickerOpen || !triggerRef.current) {
      return;
    }
    const updatePos = (): void => {
      const el = triggerRef.current;
      if (!el) {
        return;
      }
      setPopoverPos(popoverPositionUnderTrigger(el.getBoundingClientRect()));
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }
    const onDoc = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setPickerOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
        {sectionLabel}
      </p>
      <div className="relative">
        <div className="flex items-center gap-2">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              setPickerOpen((open) => !open);
            }}
            aria-expanded={pickerOpen}
            aria-haspopup="listbox"
            aria-label={t("postScheduler.channels.addChannel")}
            disabled={isLoadingProfiles && headerAccounts.length === 0}
            className={`${CHANNEL_TILE} border-dashed border-outline-variant/40 bg-surface-container-low/80 text-on-surface-variant transition-colors hover:border-secondary/50 hover:bg-surface-container-high hover:text-on-surface disabled:opacity-60`}
          >
            <span className="material-symbols-outlined text-[28px] leading-none">
              add
            </span>
          </button>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedAccounts.map((acc) => (
              <ChannelTile
                key={acc.id}
                acc={acc}
                onRemove={removeAccountId}
                t={t}
              />
            ))}
          </div>
        </div>

        {pickerOpen && typeof document !== "undefined"
          ? createPortal(
              <div
                ref={panelRef}
                className="fixed z-[200]"
                style={{ top: popoverPos.top, left: popoverPos.left }}
              >
                <WorkspaceAccountDropdownMenu
                  variant="multi"
                  accounts={pickerAccounts}
                  selectedAccountIds={selectedIds}
                  profilesError={profilesError}
                  isLoadingProfiles={isLoadingProfiles}
                  onToggleAccount={toggleAccountId}
                  onOpenPlatformsModal={() => {
                    setPickerOpen(false);
                    onConnectChannels();
                  }}
                />
              </div>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
}
