/**
 * Client-side hint before link-preview API returns. Backend is authoritative.
 */
export function facebookLinkPostPublishBlockReasonHeuristic(
  rawUrl: string,
): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
    return null;
  }
  let host = "";
  let path = "";
  try {
    const u = new URL(trimmed);
    host = u.hostname.toLowerCase();
    path = u.pathname.toLowerCase();
  } catch {
    return null;
  }
  const isFacebook =
    host === "facebook.com" ||
    host.endsWith(".facebook.com") ||
    host === "fb.com" ||
    host.endsWith(".fb.com");
  if (!isFacebook) {
    return null;
  }
  if (/^\/reel\/\d+\/?$/.test(path)) {
    return null;
  }
  if (
    path.includes("/share/") ||
    path.includes("permalink.php") ||
    /^\/\d+\/posts\/\d+\/?$/.test(path)
  ) {
    return "facebook_link_post_unsupported";
  }
  return "facebook_link_post_unsupported";
}
