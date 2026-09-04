/** Safe reads from API-shaped unknown objects (no `any`). */

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export function pickString(obj: unknown, keys: string[]): string | null {
  const o = asRecord(obj);
  if (!o) {
    return null;
  }
  for (const key of keys) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return null;
}

export function pickNumber(obj: unknown, keys: string[]): number | null {
  const o = asRecord(obj);
  if (!o) {
    return null;
  }
  for (const key of keys) {
    const v = o[key];
    if (typeof v === "number" && Number.isFinite(v)) {
      return v;
    }
  }
  return null;
}

export function pickBool(obj: unknown, keys: string[]): boolean | null {
  const o = asRecord(obj);
  if (!o) {
    return null;
  }
  for (const key of keys) {
    const v = o[key];
    if (typeof v === "boolean") {
      return v;
    }
  }
  return null;
}

export function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is Record<string, unknown> =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  );
}

export function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max - 1)}…`;
}
