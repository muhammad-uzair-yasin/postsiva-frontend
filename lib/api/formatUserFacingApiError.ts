/**
 * Normalize API / thrown error strings for display (strip raw dict blobs, etc.).
 */
export function formatUserFacingApiError(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return "Something went wrong. Try again.";
  }

  const withoutPrefix = trimmed.replace(
    /^Blue Sky authentication failed:\s*/i,
    "",
  );

  if (withoutPrefix.startsWith("{") && withoutPrefix.endsWith("}")) {
    try {
      const parsed: unknown = JSON.parse(withoutPrefix.replace(/'/g, '"'));
      if (parsed && typeof parsed === "object") {
        const o = parsed as Record<string, unknown>;
        const msg = o.message;
        if (typeof msg === "string" && msg.trim()) {
          return msg.trim();
        }
        const err = o.error;
        if (typeof err === "string" && err.trim()) {
          return err.trim();
        }
      }
    } catch {
      // fall through
    }
    const msgMatch = withoutPrefix.match(/['"]message['"]\s*:\s*['"]([^'"]+)['"]/);
    if (msgMatch?.[1]) {
      return msgMatch[1];
    }
  }

  if (/^Invalid identifier or password$/i.test(withoutPrefix)) {
    return "Invalid Bluesky handle or app password. Check both and try again.";
  }

  if (trimmed === "Failed to fetch") {
    return "Could not reach the server. Check your connection and try again.";
  }

  if (/^internal server error$/i.test(withoutPrefix)) {
    return "The server could not finish this action. Try again in a moment.";
  }

  if (/^request failed$/i.test(withoutPrefix)) {
    return "The server could not finish this action. Try again in a moment.";
  }

  if (/attributeerror|object has no attribute/i.test(withoutPrefix)) {
    return "The server hit an error while disconnecting. Try again after a refresh.";
  }

  return withoutPrefix;
}
