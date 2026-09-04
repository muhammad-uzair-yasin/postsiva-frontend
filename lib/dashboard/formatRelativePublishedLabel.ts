/** Human-readable relative time for ISO `published_at` (e.g. "2 days ago"). */
export function formatRelativePublishedLabel(
  iso: string | null | undefined,
): string {
  if (iso === null || iso === undefined || typeof iso !== "string") {
    return "—";
  }
  const date = new Date(iso);
  const t = date.getTime();
  if (Number.isNaN(t)) {
    return "—";
  }
  const now = Date.now();
  const diffSec = Math.round((t - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const absSec = Math.abs(diffSec);
  if (absSec < 60) {
    return rtf.format(Math.trunc(diffSec), "second");
  }
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, "minute");
  }
  const diffHr = Math.round(diffSec / 3600);
  if (Math.abs(diffHr) < 24) {
    return rtf.format(diffHr, "hour");
  }
  const diffDay = Math.round(diffSec / 86400);
  if (Math.abs(diffDay) < 7) {
    return rtf.format(diffDay, "day");
  }
  const diffWeek = Math.round(diffSec / (86400 * 7));
  if (Math.abs(diffWeek) < 5) {
    return rtf.format(diffWeek, "week");
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
}
