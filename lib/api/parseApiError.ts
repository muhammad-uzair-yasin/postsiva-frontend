/**
 * Normalize FastAPI / custom JSON error bodies into a single message string.
 */
export function parseApiErrorBody(body: unknown): string {
  if (body === null || body === undefined) {
    return "Request failed";
  }
  if (typeof body === "string") {
    return body;
  }
  if (typeof body !== "object") {
    return "Request failed";
  }
  const o = body as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.trim()) {
    return o.message;
  }
  const detail = o.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          const msg = (item as { msg?: unknown }).msg;
          return typeof msg === "string" ? msg : null;
        }
        return null;
      })
      .filter((s): s is string => Boolean(s));
    if (parts.length > 0) {
      return parts.join(", ");
    }
  }
  if (typeof detail === "object" && detail !== null) {
    const detailObj = detail as Record<string, unknown>;
    if (typeof detailObj.message === "string" && detailObj.message.trim()) {
      return detailObj.message;
    }
  }
  return "Request failed";
}
