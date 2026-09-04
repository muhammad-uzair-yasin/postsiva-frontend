export type DraftEditorConfirmKind =
  | "update"
  | "updateScheduled"
  | "publish"
  | "delete"
  | "deleteScheduled"
  | "schedule"
  | "reschedule"
  | "replaceImage"
  | "replaceImageUrl"
  | "moveToDraft";

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export function getDraftEditorConfirmCopy(
  t: TranslateFn,
  kind: DraftEditorConfirmKind,
  extras: {
    scheduleLabel?: string;
    fileName?: string;
    publishChannelLabel?: string;
    isVideo?: boolean;
  },
): { title: string; description: string; confirmLabel: string; isDanger: boolean } {
  switch (kind) {
    case "update":
      return {
        title: t("content.confirmUpdateTitle"),
        description: t("content.confirmUpdateBody"),
        confirmLabel: t("content.draftUpdate"),
        isDanger: false,
      };
    case "updateScheduled":
      return {
        title: t("content.confirmUpdateScheduledTitle"),
        description: t("content.confirmUpdateScheduledBody"),
        confirmLabel: t("content.scheduledUpdate"),
        isDanger: false,
      };
    case "publish": {
      const channel = extras.publishChannelLabel?.trim() ?? "";
      return {
        title: t("content.confirmPublishTitle"),
        description:
          channel.length > 0
            ? t("content.confirmPublishBodyChannel", { channel })
            : t("content.confirmPublishBody"),
        confirmLabel: t("content.draftPublishNow"),
        isDanger: false,
      };
    }
    case "delete":
      return {
        title: t("content.confirmDeleteTitle"),
        description: t("content.confirmDeleteBody"),
        confirmLabel: t("content.confirmDeleteDraft"),
        isDanger: true,
      };
    case "deleteScheduled":
      return {
        title: t("content.confirmDeleteScheduledTitle"),
        description: t("content.confirmDeleteScheduledBody"),
        confirmLabel: t("content.actionDelete"),
        isDanger: true,
      };
    case "schedule":
      return {
        title: t("content.confirmScheduleTitle"),
        description:
          extras.scheduleLabel?.trim() !== undefined &&
          extras.scheduleLabel.trim() !== ""
            ? t("content.confirmScheduleBodyLabeled", {
                time: extras.scheduleLabel.trim(),
              })
            : t("content.confirmScheduleBody"),
        confirmLabel: t("content.draftScheduleSubmit"),
        isDanger: false,
      };
    case "reschedule":
      return {
        title: t("content.confirmRescheduleTitle"),
        description:
          extras.scheduleLabel?.trim() !== undefined &&
          extras.scheduleLabel.trim() !== ""
            ? t("content.confirmRescheduleBodyLabeled", {
                time: extras.scheduleLabel.trim(),
              })
            : t("content.confirmRescheduleBody"),
        confirmLabel: t("content.confirmReschedule"),
        isDanger: false,
      };
    case "moveToDraft":
      return {
        title: t("content.confirmMoveToDraftTitle"),
        description: t("content.confirmMoveToDraftBody"),
        confirmLabel: t("content.scheduledMoveToDrafts"),
        isDanger: false,
      };
    case "replaceImage": {
      const video = extras.isVideo === true;
      return {
        title: video
          ? t("content.confirmReplaceVideoTitle")
          : t("content.confirmReplaceImageTitle"),
        description:
          extras.fileName?.trim() !== undefined && extras.fileName !== ""
            ? t(
                video
                  ? "content.confirmReplaceVideoBodyNamed"
                  : "content.confirmReplaceImageBodyNamed",
                { fileName: extras.fileName },
              )
            : t(
                video
                  ? "content.confirmReplaceVideoBody"
                  : "content.confirmReplaceImageBody",
              ),
        confirmLabel: t("content.confirmUploadApply"),
        isDanger: false,
      };
    }
    case "replaceImageUrl": {
      const video = extras.isVideo === true;
      return {
        title: video
          ? t("content.confirmReplaceVideoTitle")
          : t("content.confirmReplaceImageTitle"),
        description:
          extras.fileName?.trim() !== undefined && extras.fileName !== ""
            ? t(
                video
                  ? "content.confirmReplaceVideoLibraryBodyNamed"
                  : "content.confirmReplaceImageLibraryBodyNamed",
                { fileName: extras.fileName },
              )
            : t(
                video
                  ? "content.confirmReplaceVideoLibraryBody"
                  : "content.confirmReplaceImageLibraryBody",
              ),
        confirmLabel: video
          ? t("content.confirmLibraryApplyVideo")
          : t("content.confirmLibraryApply"),
        isDanger: false,
      };
    }
  }
}
