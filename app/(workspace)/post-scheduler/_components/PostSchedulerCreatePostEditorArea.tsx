"use client";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { formatVideoDurationClock } from "@/lib/post-composer/composerVideoDurationLimits";
import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { usePostSchedulerComposerInModal } from "../_context/PostSchedulerComposerModalLayoutContext";
import { PostSchedulerComposerMediaAttachZone } from "./PostSchedulerComposerMediaAttachZone";
import { ComposerBodyFormattedText } from "./ComposerBodyFormattedText";
import { PostSchedulerEditorAttachedMediaStrip } from "./PostSchedulerEditorAttachedMediaStrip";
import { PostSchedulerPostBodyExpandModal } from "./PostSchedulerPostBodyExpandModal";

interface PostSchedulerCreatePostEditorAreaProps {
  readonly editorBody: string;
  readonly setEditorBody: (value: string) => void;
  readonly maxBodyLength: number | undefined;
  readonly bodyCount: number;
  readonly counterClassName: string;
  readonly isGeneratingIdeaDraft: boolean;
  readonly isGeneratingImageToContent: boolean;
  readonly isGeneratingVideoToContent: boolean;
  readonly onDeviceMediaUploaded: (r: UnifiedMediaUploadWebResult) => void;
  readonly wordpressConnectionId?: string | null;
  readonly attachedMedia: readonly ComposerAttachedMedia[];
  readonly onRemoveAttachedMedia: (mediaKey: string) => void;
  readonly onMoveAttachedMedia?: (fromKey: string, toKey: string) => void;
  readonly unifiedTextLimitError: string | null;
  readonly showVideoDurationCounter: boolean;
  readonly videoDurationSeconds: number | null | undefined;
  readonly maxVideoDurationSeconds: number | undefined;
  readonly videoDurationCounterClassName: string;
  readonly videoDurationProbing: boolean;
  readonly unifiedVideoDurationError: string | null;
  readonly youtubeDescriptionError: string | null;
  readonly youtubeDescriptionNotice?: string | null;
  readonly captionDisabled?: boolean;
  readonly mediaAttachHidden?: boolean;
  /** Blog mode: grow textarea to content height instead of filling the preview column. */
  readonly compactAutoHeight?: boolean;
  /** Fired when the bordered post-body editor box resizes (for live-preview height sync). */
  readonly onBodyAreaHeightChange?: (height: number) => void;
}

export function PostSchedulerCreatePostEditorArea({
  editorBody,
  setEditorBody,
  maxBodyLength,
  bodyCount,
  counterClassName,
  isGeneratingIdeaDraft,
  isGeneratingImageToContent,
  isGeneratingVideoToContent,
  onDeviceMediaUploaded,
  wordpressConnectionId,
  attachedMedia,
  onRemoveAttachedMedia,
  onMoveAttachedMedia,
  unifiedTextLimitError,
  showVideoDurationCounter,
  videoDurationSeconds,
  maxVideoDurationSeconds,
  videoDurationCounterClassName,
  videoDurationProbing,
  unifiedVideoDurationError,
  youtubeDescriptionError,
  youtubeDescriptionNotice = null,
  captionDisabled = false,
  mediaAttachHidden = false,
  compactAutoHeight = false,
  onBodyAreaHeightChange,
}: PostSchedulerCreatePostEditorAreaProps): ReactElement {
  const { t } = useTranslations();
  const inModal = usePostSchedulerComposerInModal();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const bodyAreaRef = useRef<HTMLDivElement>(null);
  const [expandOpen, setExpandOpen] = useState(false);
  const isGeneratingContent = isGeneratingIdeaDraft || isGeneratingImageToContent || isGeneratingVideoToContent;
  const bodyPlaceholder = captionDisabled
    ? t("postScheduler.composer.storyCaptionPlaceholder")
    : t("postScheduler.composer.postBodyPlaceholder");

  const syncTextareaHeight = useCallback((): void => {
    const el = textareaRef.current;
    if (!el || !compactAutoHeight) {
      return;
    }
    el.style.height = "0px";
    el.style.height = `${Math.max(160, el.scrollHeight)}px`;
  }, [compactAutoHeight]);

  useEffect(() => {
    syncTextareaHeight();
  }, [editorBody, syncTextareaHeight]);

  const syncOverlayScroll = useCallback((): void => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay) {
      return;
    }
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
  }, []);

  useEffect(() => {
    syncOverlayScroll();
  }, [editorBody, syncOverlayScroll]);

  useEffect(() => {
    if (!onBodyAreaHeightChange) {
      return;
    }
    const el = bodyAreaRef.current;
    if (!el) {
      return;
    }
    const report = (): void => {
      onBodyAreaHeightChange(Math.round(el.getBoundingClientRect().height));
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onBodyAreaHeightChange]);

  const bodyFieldClass =
    "relative z-0 w-full rounded-[0.875rem] border-0 bg-transparent pl-4 pr-11 pb-11 pt-4 font-body text-[15px] leading-relaxed focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-surface-container/45 disabled:text-on-surface-variant disabled:placeholder:text-on-surface-variant";
  const bodyFieldSizeClass = compactAutoHeight
    ? "min-h-[10rem] resize-none overflow-hidden"
    : inModal
      ? "min-h-[11rem] flex-1 resize-none"
      : "min-h-[12rem] flex-1 resize-y";
  const showFormattedOverlay =
    !captionDisabled && !isGeneratingContent && editorBody.length > 0;

  return (
    <div
      className={`${inModal ? "mt-4" : "mt-6"} flex flex-col ${
        compactAutoHeight ? "" : "min-h-0 flex-1"
      }`}
    >
      <p className="mb-2 shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
        {captionDisabled
          ? t("postScheduler.composer.storyCaptionUnavailable")
          : t("postScheduler.composer.postBody")}
      </p>
      <div
        ref={bodyAreaRef}
        className={`relative flex flex-col rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-shadow focus-within:ring-2 focus-within:ring-secondary/25 ${
          isGeneratingContent ? "cursor-wait" : ""
        } ${compactAutoHeight ? "" : "min-h-0 flex-1"}`}
      >
        <div
        className={`relative flex flex-col overflow-hidden rounded-[0.875rem] ${
          compactAutoHeight
            ? ""
            : "min-h-0 flex-1"
        } ${isGeneratingContent ? "cursor-wait" : ""}`}
        >
          <textarea
            ref={textareaRef}
            placeholder={bodyPlaceholder}
            rows={6}
            value={captionDisabled ? "" : editorBody}
            {...(maxBodyLength !== undefined ? { maxLength: maxBodyLength } : {})}
            readOnly={isGeneratingContent}
            disabled={captionDisabled}
            aria-busy={isGeneratingContent}
            onChange={(e) => {
              setEditorBody(e.target.value);
              if (compactAutoHeight) {
                e.target.style.height = "0px";
                e.target.style.height = `${Math.max(160, e.target.scrollHeight)}px`;
              }
            }}
            onScroll={syncOverlayScroll}
            className={`${bodyFieldClass} ${bodyFieldSizeClass} ${
              showFormattedOverlay
                ? "text-transparent caret-on-surface selection:bg-primary/20 selection:text-transparent placeholder:text-transparent"
                : "text-on-surface placeholder:text-outline/45"
            }`}
          />
          {showFormattedOverlay ? (
            <div
              ref={overlayRef}
              aria-hidden
              className={`pointer-events-none absolute inset-0 z-[1] overflow-auto rounded-[0.875rem] pl-4 pr-11 pb-11 pt-4 font-body text-[15px] leading-relaxed whitespace-pre-wrap break-words text-on-surface [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
            >
              <ComposerBodyFormattedText
                text={editorBody}
                boldClassName="font-bold text-on-surface"
                highlightClassName="font-medium text-secondary"
              />
            </div>
          ) : null}
          {!captionDisabled ? (
            <button
              type="button"
              disabled={isGeneratingContent}
              onClick={() => setExpandOpen(true)}
              className="absolute right-2 top-2 z-[2] flex h-7 w-7 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
              title={t("postScheduler.composer.expandBodyAria")}
              aria-label={t("postScheduler.composer.expandBodyAria")}
            >
              <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden>
                open_in_new
              </span>
            </button>
          ) : null}
          {isGeneratingContent ? (
            <div
              className="pointer-events-none absolute inset-0 z-[3] overflow-hidden rounded-[0.875rem] bg-surface-container-lowest/40 inbox-reply-generating-shimmer"
              aria-hidden
            />
          ) : null}
        </div>
        {mediaAttachHidden ? (
          <p className="pointer-events-none absolute bottom-3 left-4 z-10 max-w-[min(100%,14rem)] text-[11px] leading-snug text-on-surface-variant/80">
            {t("postScheduler.composer.linkHint")}
          </p>
        ) : null}
        <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-2">
          {captionDisabled ? (
            <div className="flex h-8 shrink-0 items-center justify-center rounded-full px-2.5 text-[11px] font-bold text-on-surface-variant/90">
              {t("postScheduler.composer.noCaption")}
            </div>
          ) : (
            <div
              className={`flex h-8 min-w-[4rem] shrink-0 items-center justify-center rounded-full px-2.5 text-[11px] font-bold tabular-nums leading-none ${counterClassName}`}
            >
              {bodyCount}
              {maxBodyLength !== undefined ? ` / ${maxBodyLength}` : ""}
            </div>
          )}
          {showVideoDurationCounter ? (
            <div
              className={`flex h-8 min-w-[5rem] shrink-0 items-center justify-center rounded-full px-2.5 text-[11px] font-bold tabular-nums leading-none ${videoDurationCounterClassName}`}
              title={t("postScheduler.composer.videoDurationLimit")}
            >
              {videoDurationProbing
                ? "…"
                : videoDurationSeconds != null
                  ? formatVideoDurationClock(videoDurationSeconds)
                  : "—"}
              {maxVideoDurationSeconds !== undefined
                ? ` / ${formatVideoDurationClock(maxVideoDurationSeconds)}`
                : ""}
            </div>
          ) : null}
        </div>
      </div>
      {!mediaAttachHidden ? (
        <div className="mt-3 shrink-0 rounded-xl border border-outline-variant/15 bg-surface-container-low/60 px-3 py-2.5 sm:px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
            {t("postScheduler.composer.attachedMediaLabel")}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <PostSchedulerComposerMediaAttachZone
                disabled={isGeneratingContent}
                onUploaded={onDeviceMediaUploaded}
                wordpressConnectionId={wordpressConnectionId}
                heightClass="h-16"
              />
            </div>
            {attachedMedia.length > 0 ? (
              <PostSchedulerEditorAttachedMediaStrip
                media={attachedMedia}
                onRemove={onRemoveAttachedMedia}
                onMove={onMoveAttachedMedia}
                embedded
              />
            ) : null}
          </div>
        </div>
      ) : null}
      {unifiedTextLimitError ? (
        <p className="mt-3 shrink-0 text-xs font-medium text-error">
          {unifiedTextLimitError}
        </p>
      ) : null}
      {unifiedVideoDurationError ? (
        <p className="mt-3 shrink-0 text-xs font-medium text-error">
          {unifiedVideoDurationError}
        </p>
      ) : null}
      {youtubeDescriptionNotice && !youtubeDescriptionError ? (
        <div className="mt-3 flex shrink-0 items-start gap-2 rounded-lg border border-secondary/25 bg-secondary-container/10 px-3 py-2.5">
          <span className="material-symbols-outlined shrink-0 text-base text-secondary">
            info
          </span>
          <p className="text-xs font-medium leading-relaxed text-on-surface-variant">
            {youtubeDescriptionNotice}
          </p>
        </div>
      ) : null}
      {youtubeDescriptionError ? (
        <div className="mt-3 flex shrink-0 items-start gap-2 rounded-lg border border-error/20 bg-error-container/10 px-3 py-2.5">
          <span className="material-symbols-outlined shrink-0 text-base text-error">
            error
          </span>
          <p className="text-xs font-medium leading-relaxed text-error">
            {youtubeDescriptionError}
          </p>
        </div>
      ) : null}

      <PostSchedulerPostBodyExpandModal
        open={expandOpen && !captionDisabled}
        value={editorBody}
        placeholder={bodyPlaceholder}
        maxLength={maxBodyLength}
        disabled={isGeneratingContent}
        onChange={setEditorBody}
        onClose={() => setExpandOpen(false)}
      />
    </div>
  );
}
