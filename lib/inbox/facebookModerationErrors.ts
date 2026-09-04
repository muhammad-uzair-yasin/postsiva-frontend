import { formatUserFacingApiError } from "@/lib/api/formatUserFacingApiError";

/** Meta Graph (#200) when hiding/unhiding a comment authored by the Page itself. */
export function isFacebookCannotHideOwnError(message: string): boolean {
  const m = message.toLowerCase();
  if (m.includes("can not hide or unhide") || m.includes("cannot hide or unhide")) {
    return true;
  }
  if (m.includes("#200") && m.includes("hide") && m.includes("unhide")) {
    return true;
  }
  if (m.includes("hide or unhide this comment")) {
    return true;
  }
  return false;
}

export function resolveInboxModerateErrorMessage(
  platform: string,
  action: string,
  errorMessage: string,
  translateOwnCommentMessage: () => string,
): string {
  const formatted = formatUserFacingApiError(errorMessage);
  const plat = platform.trim().toLowerCase();
  const act = action.trim().toLowerCase();
  if (
    plat === "facebook" &&
    (act === "hide" || act === "unhide") &&
    isFacebookCannotHideOwnError(formatted)
  ) {
    return translateOwnCommentMessage();
  }
  return formatted;
}
