/** @deprecated Use postSchedulerPreviewCaption with t() */
export const POST_SCHEDULER_PREVIEW_BODY_PLACEHOLDER =
  "Your post text will appear here…";

export function postSchedulerPreviewCaption(
  bodyText: string | undefined,
  translate: (key: string) => string,
): string {
  const trimmed = bodyText?.trim() ?? "";
  return trimmed.length > 0
    ? trimmed
    : translate("postScheduler.preview.bodyPlaceholder");
}
