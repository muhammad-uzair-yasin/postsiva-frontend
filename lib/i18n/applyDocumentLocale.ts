import type { WorkspaceLocale } from "./locales";
import { isRtlLocale } from "./locales";

export function applyDocumentLocale(locale: WorkspaceLocale): void {
  if (typeof document === "undefined") {
    return;
  }
  const html = document.documentElement;
  html.lang = locale;
  html.dir = isRtlLocale(locale) ? "rtl" : "ltr";
}
