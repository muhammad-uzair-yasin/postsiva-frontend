const FALLBACK =
  "Facebook does not allow this URL for link posts. Use a public website link (https://…) or a facebook.com/reel/… URL. Facebook share links and other Facebook post URLs are not supported.";

export function facebookLinkPublishBlockDisplayMessage(
  reason: string | null | undefined,
  translate?: (key: string) => string,
): string | null {
  if (!reason) {
    return null;
  }
  if (reason === "facebook_link_post_unsupported") {
    return translate?.("postScheduler.composer.linkUrlPublishBlocked") ?? FALLBACK;
  }
  return reason;
}
