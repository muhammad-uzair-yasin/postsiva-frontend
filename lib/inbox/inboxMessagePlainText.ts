import type { UnifiedInboxBodySegment } from "@/lib/inbox/unifiedInboxTypes";

export function inboxBodySegmentsToPlainText(
  segments: readonly UnifiedInboxBodySegment[],
): string {
  return segments.map((s) => s.text).join("");
}
