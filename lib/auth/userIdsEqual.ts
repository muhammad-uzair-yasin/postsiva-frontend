/**
 * Compare user/workspace UUID strings from API or localStorage.
 * Handles case differences and stray whitespace (strict === often fails otherwise).
 */
export function userIdsEqual(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const x = typeof a === "string" ? a.trim().toLowerCase() : "";
  const y = typeof b === "string" ? b.trim().toLowerCase() : "";
  if (!x || !y) {
    return false;
  }
  return x === y;
}
