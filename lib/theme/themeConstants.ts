export type AppTheme =
  | "dark"
  | "light"
  | "ocean"
  | "purple"
  | "forest"
  | "sunset"
  | "warm"
  | "rose"
  | "arctic"
  | "gold"
  | "slate"
  | "mocha";

export type LayoutMode = "navbar" | "sidebar";

export const DEFAULT_THEME: AppTheme = "ocean";
export const DEFAULT_LAYOUT_MODE: LayoutMode = "sidebar";

export const APP_THEMES: readonly AppTheme[] = [
  "dark",
  "light",
  "ocean",
  "purple",
  "forest",
  "sunset",
  "warm",
  "rose",
  "arctic",
  "gold",
  "slate",
  "mocha",
] as const;

export const THEME_STORAGE_KEY = "postsiva-theme";
export const LAYOUT_STORAGE_KEY = "workspace-layout-mode";

export function isAppTheme(value: string | null | undefined): value is AppTheme {
  return Boolean(value && (APP_THEMES as readonly string[]).includes(value));
}

export function isLayoutMode(value: string | null | undefined): value is LayoutMode {
  return value === "navbar" || value === "sidebar";
}

export function applyThemeToDocument(theme: AppTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}
