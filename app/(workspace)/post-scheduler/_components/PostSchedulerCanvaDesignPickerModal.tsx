"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";

import { CANVA_ICON_SRC } from "@/lib/social/designProviderIconSrc";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useCanvaConnection } from "../../settings/_hooks/useCanvaConnection";
import { useCanvaDesignPicker } from "../_hooks/useCanvaDesignPicker";
import { MediaMasonryGrid, MediaMasonryItem } from "@/components/media/MediaMasonryGrid";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";

import { useOptionalPostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import {
  type CanvaDesignDimensions,
} from "./CanvaDesignDimensionsSelect";
import { PostSchedulerComposerMediaModalShell } from "./PostSchedulerComposerMediaModalShell";

const CANVA_MODAL_PANEL_CLASS =
  "pointer-events-auto relative z-10 flex h-[80vh] w-[80vw] max-w-[80vw] flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-high shadow-2xl";

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/** Canva design grid: my designs + search; opens editor for return export. */
export function PostSchedulerCanvaDesignPickerModal({
  visible,
  onClose,
  onBack,
  onPickMedia,
  designDimensions,
  overlayClassName = "z-[1090]",
}: {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onBack?: () => void;
  readonly onPickMedia?: (media: ComposerAttachedMedia) => void;
  readonly designDimensions: CanvaDesignDimensions;
  readonly overlayClassName?: string;
}): ReactElement | null {
  const { t } = useTranslations();
  const composerDraft = useOptionalPostSchedulerComposerDraft();
  const [search, setSearch] = useState("");
  const searchDebounced = useDebouncedValue(search, 350);
  const canva = useCanvaConnection();

  useEffect(() => {
    if (!visible) {
      return;
    }
    composerDraft?.setPreviewMediaAspectRatio(designDimensions.cssAspectRatio);
  }, [composerDraft, designDimensions.cssAspectRatio, visible]);
  const handleImport = useCallback(
    (media: ComposerAttachedMedia): void => {
      onPickMedia?.(media);
      onClose();
    },
    [onClose, onPickMedia],
  );
  const picker = useCanvaDesignPicker({
    enabled: visible && canva.connected,
    searchDebounced,
    designDimensions,
    onImport: handleImport,
  });

  const onConnect = useCallback((): void => {
    void canva.connect();
  }, [canva]);

  return (
    <PostSchedulerComposerMediaModalShell
      visible={visible}
      title={t("postScheduler.canva.modalTitle")}
      titleId="composer-canva-designs-title"
      overlayClassName={overlayClassName}
      panelClassName={CANVA_MODAL_PANEL_CLASS}
      onClose={onClose}
      onBack={onBack}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {!canva.connected ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-outline-variant/30 bg-surface-container/50 px-6 py-12 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
            <img
              src={CANVA_ICON_SRC}
              alt=""
              className="h-14 w-14 object-contain"
              loading="lazy"
              decoding="async"
            />
            <p className="max-w-md font-body text-sm text-on-surface-variant">
              {t("postScheduler.canva.connectPrompt")}
            </p>
            {canva.error ? (
              <p className="font-body text-xs text-error">{canva.error}</p>
            ) : null}
            <button
              type="button"
              disabled={canva.connecting}
              onClick={onConnect}
              className="rounded-xl bg-primary px-5 py-2.5 font-body text-sm font-bold text-on-primary disabled:opacity-60"
            >
              {canva.connecting
                ? t("postScheduler.canva.connecting")
                : t("postScheduler.canva.connectCta")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[12rem] flex-1">
                <span
                  className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant"
                  aria-hidden
                >
                  search
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("postScheduler.canva.searchPlaceholder")}
                  className="w-full rounded-xl border border-outline-variant/25 bg-surface-container py-2.5 pl-10 pr-3 font-body text-sm text-on-surface outline-none focus:border-secondary/50"
                />
              </div>
              <button
                type="button"
                disabled={picker.opening}
                onClick={() => void picker.createBlankAndOpen()}
                className="shrink-0 rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2.5 font-body text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
              >
                {t("postScheduler.canva.newDesign")}
              </button>
            </div>
            <p className="font-body text-xs text-on-surface-variant">{t("postScheduler.canva.returnHint")}</p>
            {picker.error ? (
              <p className="rounded-lg bg-error-container/30 px-3 py-2 font-body text-xs text-error">
                {picker.error}
              </p>
            ) : null}
            <div className="media-library-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {picker.loading ? (
                <p className="py-8 text-center font-body text-sm text-on-surface-variant">
                  {t("postScheduler.canva.loading")}
                </p>
              ) : picker.items.length === 0 ? (
                <p className="py-8 text-center font-body text-sm text-on-surface-variant">
                  {t("postScheduler.canva.empty")}
                </p>
              ) : (
                <MediaMasonryGrid>
                  {picker.items.map((item) => {
                    const busy =
                      picker.opening ||
                      picker.importingDesignId === item.designId;
                    return (
                      <MediaMasonryItem key={item.designId}>
                        <div className="group flex w-full flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container transition-colors hover:border-secondary/40">
                          <div className="relative w-full bg-surface-container-highest">
                            {item.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- Canva CDN thumbnails.
                              <img
                                src={item.thumbnailUrl}
                                alt=""
                                className="block w-full h-auto"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex aspect-[4/5] w-full items-center justify-center">
                                <span
                                  className="material-symbols-outlined text-3xl text-on-surface-variant"
                                  aria-hidden
                                >
                                  image
                                </span>
                              </div>
                            )}
                            {busy ? (
                              <div className="absolute inset-0 z-[20] flex flex-col items-center justify-center gap-2 bg-black/55">
                                <span
                                  className="material-symbols-outlined animate-spin text-2xl text-white"
                                  aria-hidden
                                >
                                  progress_activity
                                </span>
                                <span className="font-body text-[10px] font-bold text-white">
                                  {picker.importingDesignId === item.designId
                                    ? t("postScheduler.canva.importing")
                                    : t("postScheduler.canva.loading")}
                                </span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 z-[10] flex flex-col items-center justify-end gap-1.5 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => void picker.openDesignInCanva(item)}
                                  className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-surface/95 px-2 font-body text-[11px] font-bold text-on-surface shadow-md transition-colors hover:bg-surface"
                                >
                                  <span className="material-symbols-outlined text-sm leading-none" aria-hidden>
                                    open_in_new
                                  </span>
                                  {t("postScheduler.canva.openInCanva")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void picker.importDesignToPostsiva(item)}
                                  className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-primary px-2 font-body text-[11px] font-bold text-on-primary shadow-md transition-colors hover:bg-primary/90"
                                >
                                  <span className="material-symbols-outlined text-sm leading-none" aria-hidden>
                                    download
                                  </span>
                                  {t("postScheduler.canva.importToPostsiva")}
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="truncate px-2 py-2 font-body text-xs font-medium text-on-surface">
                            {item.title}
                          </span>
                        </div>
                      </MediaMasonryItem>
                    );
                  })}
                </MediaMasonryGrid>
              )}
              {picker.hasMore && !picker.loading ? (
                <div className="flex justify-center py-4">
                  <button
                    type="button"
                    disabled={picker.loadingMore}
                    onClick={() => void picker.loadMore()}
                    className="rounded-xl border border-outline-variant/25 px-4 py-2 font-body text-xs font-bold text-on-surface disabled:opacity-60"
                  >
                    {picker.loadingMore ? t("postScheduler.canva.loading") : t("postScheduler.canva.loadMore")}
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </PostSchedulerComposerMediaModalShell>
  );
}
