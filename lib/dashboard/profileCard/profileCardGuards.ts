export function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object";
}

export function nonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") {
    return null;
  }
  const t = v.trim();
  return t.length > 0 ? t : null;
}
