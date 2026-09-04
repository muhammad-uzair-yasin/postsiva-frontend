"use client";

import { useEffect, useMemo, useState } from "react";

import type { ComposerPlatformKind } from "@/app/(workspace)/post-scheduler/_data/postSchedulerComposerChannelAccounts";
import {
  getPreviewTabLabel,
  renderLivePreviewMockupForPlatform,
} from "@/app/(workspace)/post-scheduler/_components/postSchedulerLivePreviewByPlatform";
import {
  MAIN_WRITER_PREVIEW_IDENTITY,
  resolveMainWriterPreviewPlatforms,
} from "@/lib/admin/mainWriterPlatformPreview";
import type { MainWriterPlaygroundViewModel } from "@/lib/admin/mainWriterPlaygroundApi";
import { prepareMainWriterContentForPlatformPreview } from "@/lib/admin/mainWriterPlaygroundApi";
import { WorkspaceLocaleProvider, useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { MainWriterPreviewPlatformId } from "@/lib/admin/mainWriterPlatformPreview";

function MainWriterPlatformPreviewsInner({
  view,
  targetPlatforms,
}: {
  view: MainWriterPlaygroundViewModel;
  targetPlatforms: string[];
}) {
  const { t } = useTranslations();
  const platforms = useMemo(
    () => resolveMainWriterPreviewPlatforms(targetPlatforms),
    [targetPlatforms],
  );
  const [activePlatform, setActivePlatform] = useState<MainWriterPreviewPlatformId>(
    platforms[0] ?? "linkedin",
  );

  const safePlatform = platforms.includes(activePlatform)
    ? activePlatform
    : (platforms[0] ?? "linkedin");

  useEffect(() => {
    if (!platforms.includes(activePlatform)) {
      setActivePlatform(platforms[0] ?? "linkedin");
    }
  }, [activePlatform, platforms]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-xl bg-surface-container-low p-1">
        {platforms.map((platform) => (
          <button
            key={platform}
            type="button"
            aria-label={getPreviewTabLabel(platform, t)}
            onClick={() => setActivePlatform(platform)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors sm:px-4 ${
              safePlatform === platform
                ? "bg-primary-container text-white shadow-lg"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <SocialPlatformIcon platform={platform} className="h-4 w-4" />
            <span className="hidden sm:inline">{getPreviewTabLabel(platform, t)}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-center overflow-x-auto pb-1">
        {renderLivePreviewMockupForPlatform(
          safePlatform as ComposerPlatformKind,
          MAIN_WRITER_PREVIEW_IDENTITY,
          prepareMainWriterContentForPlatformPreview(view.content),
          [],
          view.youtubeTitle,
          null,
          false,
          null,
          false,
          view.pinterestTitle,
          view.tiktokTitle,
        )}
      </div>

      <p className="text-center text-xs text-on-surface-variant">
        Same live-preview mockups as the post scheduler. Text-only — no media attached.
      </p>
    </div>
  );
}

export function MainWriterPlatformPreviews({
  view,
  targetPlatforms,
}: {
  view: MainWriterPlaygroundViewModel;
  targetPlatforms: string[];
}) {
  return (
    <WorkspaceLocaleProvider>
      <MainWriterPlatformPreviewsInner view={view} targetPlatforms={targetPlatforms} />
    </WorkspaceLocaleProvider>
  );
}
