"use client";

import type { ReactElement } from "react";

import { useWorkspaceDocumentTitle } from "@/lib/i18n/useWorkspaceDocumentTitle";

export function WorkspacePageDocumentHead({
  titleKey,
  descriptionKey,
}: {
  titleKey: string;
  descriptionKey?: string;
}): ReactElement | null {
  useWorkspaceDocumentTitle(titleKey, descriptionKey);
  return null;
}
