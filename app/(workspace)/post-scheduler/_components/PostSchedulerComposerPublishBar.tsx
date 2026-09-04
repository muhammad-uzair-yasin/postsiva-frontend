"use client";

import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";

import { usePlanFeature } from "@/lib/billing/BillingContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { ContentManagerScheduledDateTimePickerModal } from "@/app/(workspace)/content-manager/_components/ContentManagerScheduledDateTimePickerModal";
import { startOfDay } from "@/app/(workspace)/post-scheduler/calendar/_utils/postSchedulerCalendarWeekUtils";
import { useCalendarNow } from "@/app/(workspace)/post-scheduler/calendar/_hooks/useCalendarNow";
import { usePostSchedulerComposerActionsBusySetter } from "../_context/PostSchedulerComposerActionsBusyContext";
import { usePostSchedulerComposerChannels } from "../_context/PostSchedulerComposerChannelsContext";
import { usePostSchedulerComposerInModal } from "../_context/PostSchedulerComposerModalLayoutContext";
import { useSchedulePanelDateTime } from "../_hooks/useSchedulePanelDateTime";
import { usePostSchedulerScheduleDraftActions } from "../_hooks/usePostSchedulerScheduleDraftActions";
import { PostSchedulerAiAlertModal } from "./PostSchedulerAiAlertModal";
import { usePostSchedulerAi } from "./PostSchedulerAiContext";
import { PostSchedulerPipelineSlotModal } from "./PostSchedulerPipelineSlotModal";
import { PostSchedulerPublishNowSection } from "./PostSchedulerPublishNowSection";
import { PostSchedulerSaveDraftConfirmModal } from "./PostSchedulerSaveDraftConfirmModal";

interface PostSchedulerComposerPublishBarProps {
  /** Slot time when opening from calendar / Content Manager pipeline. */
  initialScheduledAt?: Date;
  /** True when that slot should show as already selected (Schedule Now ready). */
  pipelineSlotPreselected?: boolean;
}

/** Sticky footer Publish control (modal + full-page composer). */
export function PostSchedulerComposerPublishBar({
  initialScheduledAt,
  pipelineSlotPreselected = false,
}: PostSchedulerComposerPublishBarProps): ReactElement {
  const { t, locale } = useTranslations();
  const inModal = usePostSchedulerComposerInModal();
  const { selectedAccounts } = usePostSchedulerComposerChannels();
  const { closeAiPanel } = usePostSchedulerAi();
  const { enabled: publishEnabled } = usePlanFeature("publish_enabled");
  const { enabled: draftsEnabled } = usePlanFeature("drafts_enabled");
  const { enabled: schedulingEnabled } = usePlanFeature("scheduling_enabled");
  const { scheduledAt, setScheduledAt } =
    useSchedulePanelDateTime(initialScheduledAt);
  const now = useCalendarNow();
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [hasPickedSlot, setHasPickedSlot] = useState(pipelineSlotPreselected);

  const {
    savingDraft,
    scheduling,
    channelsBusy,
    blockingAlert,
    dismissBlockingAlert,
    saveDraftConfirmVisible,
    saveDraftChannelCount,
    requestSaveDraft,
    cancelSaveDraftConfirm,
    confirmSaveDraft,
    onScheduleNow,
  } = usePostSchedulerScheduleDraftActions({ scheduledAt, hasPickedSlot });

  const setComposerActionsBusy = usePostSchedulerComposerActionsBusySetter();
  const busy = savingDraft || scheduling || channelsBusy;
  useEffect(() => {
    setComposerActionsBusy(busy);
    return () => {
      setComposerActionsBusy(false);
    };
  }, [busy, setComposerActionsBusy]);

  const scheduleLabel = hasPickedSlot
    ? t("composer.scheduleWithDate", {
        date: scheduledAt.toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
        }),
        time: scheduledAt.toLocaleTimeString(locale, {
          hour: "numeric",
          minute: "2-digit",
        }),
      })
    : t("composer.schedule");

  const onOpenSchedule = useCallback(() => {
    closeAiPanel();
    if (hasPickedSlot) {
      setTimePickerOpen(true);
      return;
    }
    setPipelineOpen(true);
  }, [closeAiPanel, hasPickedSlot]);

  const onPickScheduleSlot = useCallback(
    (at: Date) => {
      setScheduledAt(at);
      setHasPickedSlot(true);
    },
    [setScheduledAt],
  );

  const onClearScheduleSelection = useCallback(() => {
    setHasPickedSlot(false);
    setScheduledAt(new Date());
  }, [setScheduledAt]);

  const barBtnClass = inModal
    ? "inline-flex min-h-14 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-high/80 px-6 text-base font-bold text-on-surface transition hover:bg-surface-container-highest active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[3.75rem] sm:px-8"
    : "inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-high/80 px-4 text-sm font-bold text-on-surface transition hover:bg-surface-container-highest active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:px-5";
  const scheduleBtnClass = inModal
    ? `inline-flex min-h-14 max-w-[44ch] min-w-0 items-center justify-center truncate rounded-2xl border border-primary/35 bg-primary-container/10 px-6 text-base font-bold text-primary transition hover:bg-primary-container/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[3.75rem] sm:px-8 ${hasPickedSlot ? "pr-[3.5rem] sm:pr-16" : ""}`
    : `inline-flex min-h-11 max-w-[42ch] min-w-0 items-center justify-center truncate rounded-xl border border-primary/35 bg-primary-container/10 px-4 text-sm font-bold text-primary transition hover:bg-primary-container/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:px-5 ${hasPickedSlot ? "pr-[3.25rem] sm:pr-14" : ""}`;

  return (
    <>
      <div
        className={`relative bg-surface/95 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/85 ${
          inModal
            ? "shadow-none"
            : "border-t border-outline-variant/12 shadow-[0_-16px_48px_-18px_rgba(0,0,0,0.5)]"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"
          aria-hidden
        />
        <div
          className={`flex w-full min-w-0 flex-wrap items-center gap-3 sm:gap-3 ${
            inModal
              ? "justify-end px-4 py-3 sm:px-5"
              : "mx-auto max-w-[1600px] justify-end px-3 py-2 sm:px-4 sm:py-2.5"
          }`}
          style={{ paddingBottom: inModal ? "0.75rem" : "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          <div
            className={`flex min-w-0 flex-wrap items-center justify-end gap-3 sm:gap-3 ${
              inModal ? "shrink-0" : "min-w-0 flex-1"
            }`}
          >
            {draftsEnabled ? (
              <button
                type="button"
                disabled={busy}
                onClick={requestSaveDraft}
                className={barBtnClass}
              >
                {savingDraft ? t("composer.savingDraft") : t("composer.saveDraft")}
              </button>
            ) : null}
            {schedulingEnabled ? (
            <div className="relative inline-flex shrink-0">
              <button
                type="button"
                disabled={busy}
                onClick={onOpenSchedule}
                className={scheduleBtnClass}
                title={scheduleLabel}
              >
                {scheduleLabel}
              </button>
              {hasPickedSlot ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClearScheduleSelection();
                  }}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 px-1 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/75 underline-offset-2 transition hover:text-primary hover:underline disabled:pointer-events-none disabled:opacity-40 sm:right-2.5 sm:text-[11px]"
                  title={t("composer.removeScheduleTitle")}
                  aria-label={t("composer.removeScheduleTitle")}
                >
                  {t("composer.clearSchedule")}
                </button>
              ) : null}
            </div>
            ) : null}
            {publishEnabled ? (
            <div className={inModal ? "min-w-[11rem] shrink-0 sm:min-w-[13rem]" : "min-w-0 max-w-4xl shrink-0"}>
              <PostSchedulerPublishNowSection
                variant="bar"
                largeBar={inModal}
                schedulePrimary={
                  schedulingEnabled && hasPickedSlot
                    ? {
                        onSchedule: () => {
                          void onScheduleNow();
                        },
                        scheduling,
                      }
                    : undefined
                }
              />
            </div>
            ) : null}
          </div>
        </div>
      </div>
      <PostSchedulerPipelineSlotModal
        open={pipelineOpen}
        onClose={() => {
          setPipelineOpen(false);
        }}
        onPickSlot={onPickScheduleSlot}
      />
      <ContentManagerScheduledDateTimePickerModal
        open={timePickerOpen}
        day={startOfDay(scheduledAt)}
        now={now}
        initialValue={scheduledAt}
        onClose={() => {
          setTimePickerOpen(false);
        }}
        onConfirm={(at) => {
          setTimePickerOpen(false);
          onPickScheduleSlot(at);
        }}
      />
      <PostSchedulerSaveDraftConfirmModal
        visible={saveDraftConfirmVisible}
        channelCount={saveDraftChannelCount}
        targets={selectedAccounts.map((a) => ({
          displayName: a.displayName,
          platform: a.platform,
        }))}
        onCancel={cancelSaveDraftConfirm}
        onConfirm={() => {
          void confirmSaveDraft();
        }}
      />
      <PostSchedulerAiAlertModal
        visible={blockingAlert !== null}
        title={blockingAlert?.title ?? ""}
        message={blockingAlert?.message ?? ""}
        onClose={dismissBlockingAlert}
      />
    </>
  );
}
