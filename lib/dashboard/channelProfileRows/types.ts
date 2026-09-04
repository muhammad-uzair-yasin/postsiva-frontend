export interface ProfileFieldRow {
  label: string;
  value: string;
}

export function pushProfileRow(
  rows: ProfileFieldRow[],
  label: string,
  value: string | number | boolean | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }
  if (typeof value === "string" && !value.trim()) {
    return;
  }
  rows.push({
    label,
    value: typeof value === "boolean" ? (value ? "Yes" : "No") : String(value),
  });
}
