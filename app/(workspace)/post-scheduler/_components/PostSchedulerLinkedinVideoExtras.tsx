"use client";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { generateLinkedinThumbnailFromText } from "@/lib/social/linkedinThumbnailApi";
import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";
import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { usePostSchedulerDeviceMediaUpload } from "../_hooks/usePostSchedulerDeviceMediaUpload";

interface PostSchedulerLinkedinVideoExtrasProps {
  readonly thumbnailMediaId: string | null;
  readonly thumbnailPreviewUrl: string | null;
  readonly generateThumbnail: boolean;
  readonly titleText: string;
  readonly descriptionText: string;
  readonly onThumbnailUploaded: (result: UnifiedMediaUploadWebResult) => void;
  readonly onClearThumbnail: () => void;
  readonly setGenerateThumbnail: (value: boolean) => void;
  readonly onOpenMediaLibraryForThumbnail: () => void;
}

export function PostSchedulerLinkedinVideoExtras({
  thumbnailMediaId,
  thumbnailPreviewUrl,
  generateThumbnail,
  titleText,
  descriptionText,
  onThumbnailUploaded,
  onClearThumbnail,
  setGenerateThumbnail,
  onOpenMediaLibraryForThumbnail,
}: PostSchedulerLinkedinVideoExtrasProps): ReactElement {
  const { t } = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"menu" | "generate">("menu");
  const [error, setError] = useState<string | null>(null);
  const { fileInputRef, uploading, progress, hint, openFilePicker, onFileInputChange } =
    usePostSchedulerDeviceMediaUpload((result) => {
      if (result.mediaType !== "image") {
        return;
      }
      onThumbnailUploaded(result);
    });

  async function handleGenerate(): Promise<void> {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setError(t("common.signInSelectWorkspace"));
      return;
    }
    const title = titleText.trim();
    const description = descriptionText.trim();
    if (!title && !description) {
      setError(t("postScheduler.linkedin.addPostTextFirst"));
      return;
    }
    setError(null);
    setShowModal(false);
    setGenerateThumbnail(true);
    try {
      const response = await generateLinkedinThumbnailFromText(token, workspaceId, {
        ...(title ? { linkedin_title: title } : {}),
        ...(description ? { linkedin_description: description } : {}),
      });
      if (!response.success || !response.media_id || !response.image_url) {
        throw new Error(response.message || t("postScheduler.linkedin.thumbnailGenFailed"));
      }
      onThumbnailUploaded({
        mediaId: response.media_id,
        publicUrl: response.image_url,
        filename: t("postScheduler.aiToolkit.aiGeneratedImage"),
        mediaType: "image",
      });
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : t("postScheduler.linkedin.thumbnailGenFailed"),
      );
    } finally {
      setGenerateThumbnail(false);
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-outline-variant/15 bg-surface-container-low/80 px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
        {t("postScheduler.linkedin.videoOptions")}
      </p>
      <p className="mt-2 text-[11px] font-semibold text-on-surface-variant">
        {t("postScheduler.linkedin.thumbnailOptional")}
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        disabled={uploading || generateThumbnail}
        onChange={onFileInputChange}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={uploading || generateThumbnail}
          onClick={() => {
            setShowModal(true);
            setStep("menu");
            setError(null);
          }}
          className="rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-xs font-bold text-on-surface transition hover:bg-surface-container-high/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? t("postScheduler.linkedin.uploadingProgress", { progress })
            : t("postScheduler.linkedin.chooseThumbnail")}
        </button>
        {thumbnailMediaId ? (
          <button
            type="button"
            onClick={onClearThumbnail}
            className="rounded-lg border border-outline-variant/25 px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high/50"
          >
            {t("postScheduler.linkedin.clearImage")}
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-200">{hint}</p> : null}
      {error ? <p className="mt-2 text-[11px] text-error">{error}</p> : null}
      {thumbnailPreviewUrl ? (
        <div className="mt-3 flex items-start gap-3">
          <img
            src={thumbnailPreviewUrl}
            alt={t("postScheduler.preview.linkedinThumbnailAlt")}
            className="h-16 w-28 rounded-md border border-outline-variant/20 object-cover"
          />
          <p className="text-[10px] text-on-surface-variant">
            {t("postScheduler.linkedin.thumbnailSentHint")}
          </p>
        </div>
      ) : null}
      {showModal ? (
        <div className="fixed inset-0 z-[121] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-2xl">
            {step === "menu" ? (
              <>
                <p className="text-sm font-bold text-on-surface">
                  {t("postScheduler.linkedin.chooseThumbnailSource")}
                </p>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      openFilePicker();
                    }}
                    className="rounded-md border border-outline-variant/20 px-3 py-2 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-high/70"
                  >
                    {t("postScheduler.linkedin.uploadFromDevice")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      onOpenMediaLibraryForThumbnail();
                    }}
                    className="rounded-md border border-outline-variant/20 px-3 py-2 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-high/70"
                  >
                    {t("postScheduler.linkedin.chooseFromLibrary")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("generate");
                    }}
                    className="rounded-md border border-outline-variant/20 px-3 py-2 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-high/70"
                  >
                    {t("postScheduler.linkedin.generateThumbnail")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-on-surface">
                  {t("postScheduler.linkedin.confirmGenerateTitle")}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {t("postScheduler.linkedin.confirmGenerateBody")}
                </p>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("menu")}
                    className="rounded-md border border-outline-variant/20 px-3 py-2 text-xs font-bold text-on-surface-variant"
                  >
                    {t("common.back")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleGenerate();
                    }}
                    className="rounded-md bg-secondary-container px-3 py-2 text-xs font-bold text-on-secondary-container"
                  >
                    {t("postScheduler.linkedin.confirmGenerate")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
