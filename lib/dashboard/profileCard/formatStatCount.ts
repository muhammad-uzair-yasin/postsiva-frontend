/** Compact display for profile counters (posts, followers, etc.). */
export function formatStatCount(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }
  const n = value;
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`.replace(/\.0M$/, "M");
  }
  if (n >= 10_000) {
    return `${(n / 1_000).toFixed(1)}k`;
  }
  if (n >= 1_000) {
    return n.toLocaleString();
  }
  return String(n);
}
