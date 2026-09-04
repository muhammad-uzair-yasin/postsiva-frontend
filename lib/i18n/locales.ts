/** Workspace locales supported by backend + UI. */
export const WORKSPACE_LOCALES = ["en", "bs"] as const;

export type WorkspaceLocale = (typeof WORKSPACE_LOCALES)[number];

export const DEFAULT_WORKSPACE_LOCALE: WorkspaceLocale = "en";

export const RTL_LOCALES = new Set<WorkspaceLocale>();

export const LOCALE_OPTIONS: ReadonlyArray<{
  value: WorkspaceLocale;
  label: string;
}> = [
  { value: "en", label: "English" },
  { value: "bs", label: "Bosnian (Bosanski)" },
];

export function isWorkspaceLocale(value: string | null | undefined): value is WorkspaceLocale {
  return WORKSPACE_LOCALES.includes(value as WorkspaceLocale);
}

export function normalizeWorkspaceLocale(value: string | null | undefined): WorkspaceLocale {
  return isWorkspaceLocale(value) ? value : DEFAULT_WORKSPACE_LOCALE;
}

export function isRtlLocale(locale: WorkspaceLocale): boolean {
  return RTL_LOCALES.has(locale);
}
