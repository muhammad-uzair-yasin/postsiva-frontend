/**
 * YouTube video description rules (see YouTube Help: no angle brackets).
 */
export function sanitizeYoutubeDescription(description: string): string {
  return description.replace(/[<>]/g, "");
}

/** Non-blocking notice when brackets will be stripped on publish. */
export function youtubeDescriptionBracketNotice(
  description: string,
): string | null {
  if (/[<>]/.test(description)) {
    return "YouTube doesn't allow < or > in descriptions. Those characters will be removed when you post.";
  }
  return null;
}

/**
 * Hard validation (blocks publish): length only. Brackets are auto-stripped via
 * {@link sanitizeYoutubeDescription} at publish time.
 */
export function validateYoutubeDescription(description: string): string | null {
  if (description.length > 5000) {
    return `YouTube description limit is 5,000 characters. Current: ${description.length}`;
  }
  return null;
}
