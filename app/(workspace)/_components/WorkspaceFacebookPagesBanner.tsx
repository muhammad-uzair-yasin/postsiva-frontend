"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceHeaderAccounts } from "./WorkspaceHeaderAccountsProvider";

/** One line under the user profile when Facebook is connected but no Pages were returned from the API. */
export function WorkspaceFacebookPagesBanner(): ReactElement | null {
  const { t } = useTranslations();
  const { accounts } = useWorkspaceHeaderAccounts();
  // Show only when there are literally no facebook page rows available.
  // (Parent `id === "facebook"` is intentionally disabled when Pages exist, but we shouldn't treat that as "missing pages".)
  const show = !accounts.some((a) => a.id.startsWith("facebook:page:"));
  if (!show) {
    return null;
  }
  return (
    <p className="max-w-[14rem] text-[10px] leading-snug text-amber-400/95 sm:max-w-xs sm:text-[11px]">
      {t("settings.facebookPagesRequired")}
    </p>
  );
}
