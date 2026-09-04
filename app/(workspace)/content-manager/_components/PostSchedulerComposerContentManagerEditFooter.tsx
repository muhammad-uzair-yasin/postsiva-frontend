"use client";

import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { WorkspaceComposerEditSession } from "@/lib/post-composer/composerEditSessionFromUnifiedPost";

import { PostSchedulerPipelineSlotModal } from "../../post-scheduler/_components/PostSchedulerPipelineSlotModal";
import { useSocialComposerEditActions } from "../_hooks/useSocialComposerEditActions";
import { WordPressUnifiedEditActionBar } from "./WordPressUnifiedEditActionBar";

function formatScheduledTimeLabel(
  session: WorkspaceComposerEditSession,
): string | null {
  if (session.kind !== "scheduled") {
    return null;
  }
  const formatted = session.scheduled.scheduled_time_formatted?.trim();
  if (formatted) {
    return formatted;
  }
  const raw =
    session.scheduled.scheduled_time_local?.trim() ||
    session.scheduled.scheduled_time?.trim();
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PostSchedulerComposerContentManagerEditFooter({
  session,
  onClose,
  onUpdateSuccess,
  onScheduleComplete,
  onPublishSuccess,
  onDeleteSuccess,
  onMoveToDraftSuccess,
}: {
  session: WorkspaceComposerEditSession;
  onClose: () => void;
  onUpdateSuccess?: () => void;
  onScheduleComplete?: () => void;
  onPublishSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onMoveToDraftSuccess?: () => void;
}): ReactElement {
  const platform = session.platform.trim().toLowerCase();
  if (platform === "wordpress") {
    const connectionId = session.lockedAccountId.replace(/^wordpress:/, "");
    return (
      <WordPressUnifiedEditActionBar
        mode={session.kind}
        connectionId={connectionId}
        draftId={session.kind === "draft" ? session.draftId : undefined}
        scheduledPostId={
          session.kind === "scheduled" ? session.scheduledPostId : undefined
        }
        onClose={onClose}
        onUpdateSuccess={onUpdateSuccess}
        onScheduleComplete={onScheduleComplete}
        onPublishSuccess={onPublishSuccess}
        onDeleteSuccess={onDeleteSuccess}
        onMoveToDraftSuccess={onMoveToDraftSuccess}
      />
    );
  }

  return (
    <SocialComposerEditActionBar
      session={session}
      onClose={onClose}
      onUpdateSuccess={onUpdateSuccess}
      onScheduleComplete={onScheduleComplete}
      onPublishSuccess={onPublishSuccess}
      onDeleteSuccess={onDeleteSuccess}
      onMoveToDraftSuccess={onMoveToDraftSuccess}
    />
  );
}

function SocialComposerEditActionBar({
  session,
  onClose,
  onUpdateSuccess,
  onScheduleComplete,
  onPublishSuccess,
  onDeleteSuccess,
  onMoveToDraftSuccess,
}: {
  session: WorkspaceComposerEditSession;
  onClose: () => void;
  onUpdateSuccess?: () => void;
  onScheduleComplete?: () => void;
  onPublishSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onMoveToDraftSuccess?: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const draftId = session.kind === "draft" ? session.draftId : undefined;
  const scheduledPostId =
    session.kind === "scheduled" ? session.scheduledPostId : undefined;
  const scheduledTimeLabel = formatScheduledTimeLabel(session);

  const {
    busy,
    error,
    save,
    schedule,
    reschedule,
    publish,
    remove,
    moveToDraft,
  } = useSocialComposerEditActions({
    mode: session.kind,
    draftId,
    scheduledPostId,
    platform: session.platform,
    onSaved: onUpdateSuccess,
    onScheduled: onScheduleComplete,
    onPublished: onPublishSuccess,
    onDeleted: onDeleteSuccess,
    onMovedToDraft: onMoveToDraftSuccess,
  });

  return (
    <>
      <div className="border-t border-outline-variant/15 bg-surface px-4 py-3 sm:px-5">
        {error ? (
          <p className="mb-2 rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {scheduledTimeLabel ? (
            <div className="mr-1 rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                Scheduled for
              </p>
              <p className="text-xs font-bold text-on-surface">{scheduledTimeLabel}</p>
            </div>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void save();
            }}
            className="rounded-xl bg-surface-container-high px-4 py-2.5 text-sm font-bold text-on-surface disabled:opacity-50"
          >
            {busy ? t("content.draftModalSaving") : t("common.save")}
          </button>
          {session.kind === "draft" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setScheduleOpen(true)}
              className="rounded-xl bg-secondary-container px-4 py-2.5 text-sm font-bold text-on-secondary-container disabled:opacity-50"
            >
              {t("composer.schedule")}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setScheduleOpen(true)}
              className="rounded-xl bg-secondary-container px-4 py-2.5 text-sm font-bold text-on-secondary-container disabled:opacity-50"
            >
              {t("content.confirmReschedule")}
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void publish();
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
          >
            {t("composer.publishNow")}
          </button>
          <div className="ml-auto flex flex-wrap gap-2">
            {session.kind === "scheduled" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void moveToDraft();
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-on-surface-variant disabled:opacity-50"
              >
                {t("content.scheduledMoveToDrafts")}
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void remove();
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-error disabled:opacity-50"
            >
              {t("content.actionDelete")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-primary disabled:opacity-50"
            >
              {t("content.actionClose")}
            </button>
          </div>
        </div>
      </div>
      <PostSchedulerPipelineSlotModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onPickSlot={(at) => {
          setScheduleOpen(false);
          const iso = at.toISOString();
          if (session.kind === "draft") {
            void schedule(iso);
          } else {
            void reschedule(iso);
          }
        }}
      />
    </>
  );
}
