/** Public (pre-login) locale storage — separate from workspace locale. */

import {
  DEFAULT_WORKSPACE_LOCALE,
  isWorkspaceLocale,
  normalizeWorkspaceLocale,
  type WorkspaceLocale,
} from "./locales";

export const PUBLIC_LOCALE_STORAGE_KEY = "postsiva-public-locale";

export type PublicLocale = WorkspaceLocale;

export function detectBrowserPublicLocale(): PublicLocale {
  if (typeof navigator === "undefined") {
    return DEFAULT_WORKSPACE_LOCALE;
  }
  const langs = [navigator.language, ...(navigator.languages ?? [])];
  for (const raw of langs) {
    const base = (raw || "").toLowerCase().split("-")[0];
    if (base === "bs" || base === "hr" || base === "sr") {
      return "bs";
    }
  }
  return DEFAULT_WORKSPACE_LOCALE;
}

export function readStoredPublicLocale(): PublicLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PUBLIC_LOCALE_STORAGE_KEY);
    return isWorkspaceLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeStoredPublicLocale(locale: PublicLocale): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PUBLIC_LOCALE_STORAGE_KEY, normalizeWorkspaceLocale(locale));
  } catch {
    /* ignore */
  }
}

export function resolveInitialPublicLocale(
  searchLang?: string | null,
): PublicLocale {
  if (isWorkspaceLocale(searchLang)) {
    return searchLang;
  }
  return readStoredPublicLocale() ?? detectBrowserPublicLocale();
}
