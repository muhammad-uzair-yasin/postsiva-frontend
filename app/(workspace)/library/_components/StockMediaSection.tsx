"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  importStockMedia,
  selectUnsplashPhoto,
  type StockMediaItem,
} from "@/lib/social/stockMediaApi";
import { invalidateUnifiedMediaListCache } from "@/lib/social/unifiedMediaApi";
import { MediaMasonryGrid, MediaMasonryItem } from "@/components/media/MediaMasonryGrid";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { withUnsplashUtm } from "@/lib/social/unsplashAttribution";

import { stashLibraryUseInPost } from "../../post-scheduler/_utils/postSchedulerLibraryHandoff";
import { useStockMediaSearch } from "../_hooks/useStockMediaSearch";
import { StockMediaFiltersBar } from "./StockMediaFiltersBar";
import { StockMediaTile } from "./StockMediaTile";
import { UnsplashPhotoCard } from "./UnsplashPhotoCard";

function isUnsplashItem(item: StockMediaItem): boolean {
  return item.stock_id.startsWith("us:");
}

function toAttachedMedia(item: StockMediaItem): ComposerAttachedMedia {
  return {
    mediaId: "",
    publicUrl: item.full_url,
    mediaType: item.media_type,
    filename: `stock-${item.stock_id.replace(":", "-")}`,
    thumbnailUrl: item.thumb_url || undefined,
    ...(isUnsplashItem(item)
      ? {
          attribution: {
            provider: "unsplash",
            creatorName: item.credit_name,
            creatorProfileUrl: withUnsplashUtm(item.credit_url || "https://unsplash.com/"),
            sourcePageUrl: item.source_page_url,
            creatorUsername: item.creator_username,
          },
        }
      : {}),
  };
}

export function StockMediaSection({
  onSavedToLibrary,
  onPickStock,
}: {
  onSavedToLibrary: () => void;
  /** When set (composer modal), picks hand attached media to the caller instead of navigating. */
  onPickStock?: (media: ComposerAttachedMedia) => void;
}): ReactElement {
  const { t } = useTranslations();
  const router = useRouter();
  const search = useStockMediaSearch();
  const skeletonAspects = ["16 / 9", "4 / 5", "1 / 1", "3 / 4", "16 / 10"] as const;
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importAction, setImportAction] = useState<"use" | "save" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const attach = useCallback(
    (media: ComposerAttachedMedia): void => {
      if (onPickStock) {
        onPickStock(media);
        return;
      }
      stashLibraryUseInPost(media);
      router.push("/post-scheduler");
    },
    [onPickStock, router],
  );

  const handleUseInPost = useCallback(
    (item: StockMediaItem): void => {
      // No download/upload here: attach the stock URL directly; the posting APIs
      // resolve external media URLs into Postsiva storage at publish time.
      attach(toAttachedMedia(item));
    },
    [attach],
  );

  const handleUseUnsplashImage = useCallback(
    async (item: StockMediaItem): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim() || importingId) {
        return;
      }
      setImportingId(item.stock_id);
      setImportAction("use");
      setImportError(null);
      try {
        // Unsplash compliance: register the download event before using the photo.
        const res = await selectUnsplashPhoto(token, workspaceId, item.stock_id);
        attach(toAttachedMedia(res.item));
      } catch (e) {
        setImportError(
          e instanceof Error ? e.message : t("postScheduler.mediaLibrary.stockLoadError"),
        );
      } finally {
        setImportingId(null);
        setImportAction(null);
      }
    },
    [attach, importingId, t],
  );

  const runImport = useCallback(
    async (item: StockMediaItem, action: "save"): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim() || importingId) {
        return;
      }
      setImportingId(item.stock_id);
      setImportAction(action);
      setImportError(null);
      setNotice(null);
      try {
        await importStockMedia(token, workspaceId, item);
        invalidateUnifiedMediaListCache();
        setNotice(t("postScheduler.mediaLibrary.stockSaved"));
        onSavedToLibrary();
        window.setTimeout(() => {
          setNotice(null);
        }, 4000);
      } catch (e) {
        setImportError(
          e instanceof Error ? e.message : t("postScheduler.mediaLibrary.stockLoadError"),
        );
      } finally {
        setImportingId(null);
        setImportAction(null);
      }
    },
    [importingId, onSavedToLibrary, t],
  );

  return (
    <div className="flex flex-col gap-4">
      <StockMediaFiltersBar
        query={search.query}
        setQuery={search.setQuery}
        applySearch={search.applySearch}
        mediaType={search.mediaType}
        setMediaType={search.setMediaType}
        filters={search.filters}
        setFilters={search.setFilters}
      />

      {notice ? (
        <p className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-2.5 text-xs font-bold text-secondary" role="status">
          {notice}
        </p>
      ) : null}
      {importError ? (
        <p className="rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-xs font-semibold text-error" role="alert">
          {importError}
        </p>
      ) : null}

      {search.loading ? (
        <div aria-busy aria-label={t("postScheduler.mediaLibrary.loadingAria")}>
          <MediaMasonryGrid>
          {Array.from({ length: 10 }, (_, i) => (
            <MediaMasonryItem key={i}>
              <div
                className="relative w-full overflow-hidden rounded-xl bg-surface-container-low ring-1 ring-outline-variant/10"
                style={{ aspectRatio: skeletonAspects[i % skeletonAspects.length] }}
              >
                <div className="inbox-reply-generating-shimmer pointer-events-none absolute inset-0 opacity-90" />
              </div>
            </MediaMasonryItem>
          ))}
          </MediaMasonryGrid>
        </div>
      ) : null}

      {!search.loading && search.error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-error/30 bg-error/5 px-4 py-12 text-center">
          <span className="material-symbols-outlined text-4xl text-error/80" aria-hidden>
            cloud_off
          </span>
          <p className="max-w-xs text-sm text-on-surface-variant">{search.error}</p>
        </div>
      ) : null}

      {!search.loading && !search.error && search.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-4 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-secondary/35" aria-hidden>
            image_search
          </span>
          <p className="max-w-[20rem] text-sm leading-relaxed text-on-surface-variant">
            {t("postScheduler.mediaLibrary.stockEmpty")}
          </p>
        </div>
      ) : null}

      {!search.loading && !search.error && search.items.length > 0 ? (
        <>
          <MediaMasonryGrid>
            {search.items.map((item) => (
              <MediaMasonryItem key={item.stock_id}>
                {isUnsplashItem(item) ? (
                  <UnsplashPhotoCard
                    item={item}
                    importing={importingId === item.stock_id}
                    onUseImage={() => {
                      void handleUseUnsplashImage(item);
                    }}
                  />
                ) : (
                  <StockMediaTile
                    item={item}
                    importing={importingId === item.stock_id ? importAction : null}
                    onUseInPost={() => {
                      handleUseInPost(item);
                    }}
                    onSaveToLibrary={() => {
                      void runImport(item, "save");
                    }}
                  />
                )}
              </MediaMasonryItem>
            ))}
          </MediaMasonryGrid>
          {search.hasMore ? (
            <button
              type="button"
              disabled={search.loadingMore}
              onClick={search.loadMore}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-high/60 py-3 text-xs font-bold text-on-surface shadow-sm transition-colors hover:border-secondary/35 hover:text-secondary disabled:opacity-60"
            >
              {search.loadingMore ? (
                <span className="material-symbols-outlined animate-spin text-base" aria-hidden>
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-base" aria-hidden>
                  expand_more
                </span>
              )}
              {t("postScheduler.mediaLibrary.loadMore")}
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
