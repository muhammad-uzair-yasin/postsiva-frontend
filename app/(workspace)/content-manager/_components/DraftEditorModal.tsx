"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";

import { useDraftEditorActions } from "../draft/[id]/_hooks/useDraftEditorActions";
import type { UseDraftEditorActionsCallbacks } from "../draft/[id]/_hooks/useDraftEditorActions";
import { useDraftEditorLoad } from "../draft/[id]/_hooks/useDraftEditorLoad";
import { useDraftEditorScheduleAndImage } from "../draft/[id]/_hooks/useDraftEditorScheduleAndImage";
import type { UseDraftEditorScheduleAndImageOptions } from "../draft/[id]/_hooks/useDraftEditorScheduleAndImage";
import { DraftEditorLoaded } from "../draft/[id]/_components/DraftEditorLoaded";
import { WordPressUnifiedEditComposerModal } from "./WordPressUnifiedEditComposerModal";

export interface DraftEditorModalBusyOverlay {
  active: boolean;
  mode: "save" | "schedule";
}

interface DraftEditorModalProps {
  initialDraft: UnifiedDraftResponseJson | null;
  onClose: () => void;
  onUpdateSuccess?: () => void;
  /** Custom schedule success (close modal, toast, go to Scheduled tab). Omit to use default navigation only (full-page editor). */
  onScheduleComplete?: () => void;
  onPublishSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

function DraftEditorModalBody({
  initialDraft,
  onUpdateSuccess,
  actionCallbacks,
  scheduleOptions,
  onBusyOverlayChange,
}: {
  initialDraft: UnifiedDraftResponseJson;
  onUpdateSuccess?: () => void;
  actionCallbacks: UseDraftEditorActionsCallbacks;
  scheduleOptions?: UseDraftEditorScheduleAndImageOptions;
  onBusyOverlayChange?: (
    s: DraftEditorModalBusyOverlay | { active: false },
  ) => void;
}): ReactElement {
  const { t } = useTranslations();
  const draftId = initialDraft.id;
  const { draft, caption, setCaption, loadError, isLoading, setDraft } =
    useDraftEditorLoad(draftId, initialDraft);
  const { isSaving, actionError, save, publish, remove, changeAccount } =
    useDraftEditorActions(
      draftId,
      caption,
      draft?.platform ?? initialDraft.platform,
      setDraft,
      setCaption,
      undefined,
      actionCallbacks,
    );
  const {
    mediaBusy,
    mediaError,
    scheduleBusy,
    scheduleError,
    scheduleDraft,
    changeMediaFromFile,
    changeMediaFromUrl,
  } = useDraftEditorScheduleAndImage(draftId, setDraft, scheduleOptions);

  useEffect(() => {
    const busy = isSaving || scheduleBusy;
    if (!busy) {
      onBusyOverlayChange?.({ active: false });
      return;
    }
    if (scheduleBusy && !isSaving) {
      onBusyOverlayChange?.({ active: true, mode: "schedule" });
    } else {
      onBusyOverlayChange?.({ active: true, mode: "save" });
    }
  }, [isSaving, scheduleBusy, onBusyOverlayChange]);

  return (
    <>
      {isLoading ? (
        <p className="text-on-surface-variant">{t("content.draftLoading")}</p>
      ) : null}
      {loadError ? (
        <p className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {loadError}
        </p>
      ) : null}
      {!isLoading && draft && !loadError ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <DraftEditorLoaded
            draft={draft}
            caption={caption}
            onCaptionChange={setCaption}
            actionError={actionError}
            isSaving={isSaving}
            mediaBusy={mediaBusy}
            mediaError={mediaError}
            scheduleBusy={scheduleBusy}
            scheduleError={scheduleError}
            onPickMedia={(file, kind) => {
              void changeMediaFromFile(file, kind);
            }}
            onPickLibraryMedia={(url, mediaId, kind) => {
              void changeMediaFromUrl(url, mediaId, kind);
            }}
            onSchedule={(isoUtc) => {
              void scheduleDraft(isoUtc);
            }}
            onSave={(extra) => save(extra)}
            onPublish={() => {
              void publish();
            }}
            onRemove={() => {
              void remove();
            }}
            onChangeAccount={changeAccount}
            onUpdateSuccess={onUpdateSuccess}
            compact
          />
        </div>
      ) : null}
    </>
  );
}

export function DraftEditorModal({
  initialDraft,
  onClose,
  onUpdateSuccess,
  onScheduleComplete,
  onPublishSuccess,
  onDeleteSuccess,
}: DraftEditorModalProps): ReactElement | null {
  const draftId = initialDraft?.id ?? null;

  useEffect(() => {
    if (!draftId) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [draftId]);

  if (!initialDraft) {
    return null;
  }

  if (initialDraft.platform?.trim().toLowerCase() === "wordpress") {
    return (
      <WordPressUnifiedEditComposerModal
        mode="draft"
        draft={initialDraft}
        onClose={onClose}
        onUpdateSuccess={onUpdateSuccess}
        onScheduleComplete={onScheduleComplete}
        onPublishSuccess={onPublishSuccess}
        onDeleteSuccess={onDeleteSuccess}
      />
    );
  }

  return (
    <DraftEditorModalShell
      initialDraft={initialDraft}
      onClose={onClose}
      onUpdateSuccess={onUpdateSuccess}
      onScheduleComplete={onScheduleComplete}
      onPublishSuccess={onPublishSuccess}
      onDeleteSuccess={onDeleteSuccess}
    />
  );
}

function DraftEditorModalShell({
  initialDraft,
  onClose,
  onUpdateSuccess,
  onScheduleComplete,
  onPublishSuccess,
  onDeleteSuccess,
}: {
  initialDraft: UnifiedDraftResponseJson;
  onClose: () => void;
  onUpdateSuccess?: () => void;
  onScheduleComplete?: () => void;
  onPublishSuccess?: () => void;
  onDeleteSuccess?: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const [busyOverlay, setBusyOverlay] = useState<
    DraftEditorModalBusyOverlay | { active: false }
  >({ active: false });

  const actionCallbacks = useMemo(
    (): UseDraftEditorActionsCallbacks => ({
      onAfterPublishOrDelete: onClose,
      onPublishSuccess,
      onDeleteSuccess,
    }),
    [onClose, onPublishSuccess, onDeleteSuccess],
  );

  const scheduleOptions = useMemo((): UseDraftEditorScheduleAndImageOptions => {
    if (onScheduleComplete) {
      return { onScheduleSuccess: onScheduleComplete };
    }
    return {};
  }, [onScheduleComplete]);

  const overlayActive = busyOverlay.active === true;
  const overlayMode = busyOverlay.active === true ? busyOverlay.mode : "save";

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !overlayActive) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [overlayActive, onClose]);

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("content.draftModalCloseAria")}
        className="draft-editor-modal-backdrop-animate absolute inset-0 z-[110] bg-black/70"
        onClick={() => {
          if (!overlayActive) {
            onClose();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-editor-modal-title"
        className="draft-editor-modal-shell-animate relative z-[111] flex max-h-[min(85vh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-outline-variant/20 bg-surface shadow-2xl sm:mx-4 sm:rounded-2xl"
      >
        {overlayActive ? (
          <div
            className="draft-editor-busy-overlay-animate absolute inset-0 z-[112] flex flex-col items-center justify-center gap-3 rounded-[inherit] bg-surface/85 backdrop-blur-md"
            aria-busy
            aria-live="polite"
          >
            <span
              className="material-symbols-outlined animate-spin text-4xl text-secondary"
              aria-hidden
            >
              progress_activity
            </span>
            <p className="text-center text-sm font-semibold text-on-surface">
              {overlayMode === "schedule"
                ? t("content.draftModalScheduling")
                : t("content.draftModalSaving")}
            </p>
            <p className="max-w-xs text-center text-xs text-on-surface-variant">
              {overlayMode === "schedule"
                ? t("content.draftModalSchedulingHint")
                : t("content.draftModalSavingHint")}
            </p>
          </div>
        ) : null}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/10 px-3 py-2.5 sm:px-4">
          <h2
            id="draft-editor-modal-title"
            className="text-base font-bold text-on-surface"
          >
            {t("content.draftEditTitle")}
          </h2>
          <button
            type="button"
            disabled={overlayActive}
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("content.actionClose")}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-3 sm:px-4">
          <DraftEditorModalBody
            key={initialDraft.id}
            initialDraft={initialDraft}
            onUpdateSuccess={onUpdateSuccess}
            actionCallbacks={actionCallbacks}
            scheduleOptions={scheduleOptions}
            onBusyOverlayChange={setBusyOverlay}
          />
        </div>
      </div>
    </div>
  );
}
