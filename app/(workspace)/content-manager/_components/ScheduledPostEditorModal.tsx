"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";

import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import {
  ScheduledPostEditorLoaded,
  type ScheduledPostEditorModalBusyOverlay,
} from "../draft/[id]/_components/ScheduledPostEditorLoaded";
import { WordPressUnifiedEditComposerModal } from "./WordPressUnifiedEditComposerModal";

interface ScheduledPostEditorModalProps {
  initialScheduled: UnifiedScheduledPostItemJson | null;
  onClose: () => void;
  onUpdateSuccess?: () => void;
  onRescheduleComplete?: () => void;
  onPublishSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onMoveToDraftSuccess?: () => void;
}

export function ScheduledPostEditorModal({
  initialScheduled,
  onClose,
  onUpdateSuccess,
  onRescheduleComplete,
  onPublishSuccess,
  onDeleteSuccess,
  onMoveToDraftSuccess,
}: ScheduledPostEditorModalProps): ReactElement | null {
  const id = initialScheduled?.scheduled_post_id ?? null;

  useEffect(() => {
    if (!id) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [id]);

  if (!initialScheduled) {
    return null;
  }

  if (initialScheduled.platform?.trim().toLowerCase() === "wordpress") {
    return (
      <WordPressUnifiedEditComposerModal
        mode="scheduled"
        scheduled={initialScheduled}
        onClose={onClose}
        onUpdateSuccess={onUpdateSuccess}
        onScheduleComplete={onRescheduleComplete}
        onPublishSuccess={onPublishSuccess}
        onDeleteSuccess={onDeleteSuccess}
        onMoveToDraftSuccess={onMoveToDraftSuccess}
      />
    );
  }

  return (
    <ScheduledPostEditorModalShell
      initialScheduled={initialScheduled}
      onClose={onClose}
      onUpdateSuccess={onUpdateSuccess}
      onRescheduleComplete={onRescheduleComplete}
      onPublishSuccess={onPublishSuccess}
      onDeleteSuccess={onDeleteSuccess}
      onMoveToDraftSuccess={onMoveToDraftSuccess}
    />
  );
}

function ScheduledPostEditorModalShell({
  initialScheduled,
  onClose,
  onUpdateSuccess,
  onRescheduleComplete,
  onPublishSuccess,
  onDeleteSuccess,
  onMoveToDraftSuccess,
}: {
  initialScheduled: UnifiedScheduledPostItemJson;
  onClose: () => void;
  onUpdateSuccess?: () => void;
  onRescheduleComplete?: () => void;
  onPublishSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onMoveToDraftSuccess?: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const [busyOverlay, setBusyOverlay] = useState<
    ScheduledPostEditorModalBusyOverlay | { active: false }
  >({ active: false });

  // Reset the busy overlay whenever a different post is loaded into this shell.
  // Without this, deleting post A and immediately opening post B re-uses the
  // same shell instance, which still holds { active: true } from the delete.
  const postId = initialScheduled.scheduled_post_id;
  useEffect(() => {
    setBusyOverlay({ active: false });
  }, [postId]);

  const actionCallbacks = useMemo(
    () => ({
      onAfterClose: onClose,
      onUpdateSuccess,
      onRescheduleSuccess: onRescheduleComplete,
      onPublishSuccess,
      onDeleteSuccess,
      onMoveToDraftSuccess,
    }),
    [
      onClose,
      onDeleteSuccess,
      onMoveToDraftSuccess,
      onPublishSuccess,
      onRescheduleComplete,
      onUpdateSuccess,
    ],
  );

  const overlayActive = busyOverlay.active === true;
  const overlayMode =
    busyOverlay.active === true ? busyOverlay.mode : "save";

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
        aria-label={t("content.scheduledModalCloseAria")}
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
        aria-labelledby="scheduled-post-editor-modal-title"
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
              {overlayMode === "publish"
                ? t("content.scheduledModalPublishing")
                : overlayMode === "schedule"
                  ? t("content.scheduledModalUpdating")
                  : overlayMode === "media"
                    ? t("content.scheduledModalMediaUpdating")
                    : t("content.scheduledModalSaving")}
            </p>
            <p className="max-w-xs text-center text-xs text-on-surface-variant">
              {overlayMode === "publish"
                ? t("content.scheduledModalPublishingHint")
                : overlayMode === "schedule"
                  ? t("content.scheduledModalUpdatingHint")
                  : overlayMode === "media"
                    ? t("content.scheduledModalMediaUpdatingHint")
                    : t("content.scheduledModalSavingHint")}
            </p>
          </div>
        ) : null}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/10 px-3 py-2.5 sm:px-4">
          <h2
            id="scheduled-post-editor-modal-title"
            className="text-base font-bold text-on-surface"
          >
            {t("content.scheduledEditTitle")}
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
          <ScheduledPostEditorLoaded
            key={initialScheduled.scheduled_post_id}
            initialScheduled={initialScheduled}
            actionCallbacks={actionCallbacks}
            onBusyOverlayChange={setBusyOverlay}
          />
        </div>
      </div>
    </div>
  );
}
