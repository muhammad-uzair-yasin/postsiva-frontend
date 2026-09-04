"use client";

import { useEffect } from "react";

import { useTranslations } from "./WorkspaceLocaleProvider";

/** Sets `document.title` (and optional meta description) from i18n keys. */
export function useWorkspaceDocumentTitle(
  titleKey: string,
  descriptionKey?: string,
): void {
  const { t } = useTranslations();

  useEffect(() => {
    document.title = t(titleKey);
    if (!descriptionKey) {
      return;
    }
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", t(descriptionKey));
    }
  }, [t, titleKey, descriptionKey]);
}
