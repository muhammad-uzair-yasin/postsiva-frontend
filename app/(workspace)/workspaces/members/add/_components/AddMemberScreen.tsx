"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  WORKSPACE_MAIN_CONTENT_CLASS,
  WorkspacePageScaffold,
} from "../../../../_components/WorkspacePageScaffold";
import { WorkspacePageDocumentHead } from "../../../../_components/WorkspacePageDocumentHead";

export function AddMemberScreen(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <WorkspacePageScaffold
      mainClassName={`${WORKSPACE_MAIN_CONTENT_CLASS} flex flex-col items-center`}
    >
      <WorkspacePageDocumentHead
        titleKey="workspaces.inviteMetaTitle"
        descriptionKey="workspaces.inviteMetaDescription"
      />
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/10 bg-surface-container p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-on-surface">
            {t("workspaces.inviteTitle")}
          </h1>
          <Link
            href="/workspaces"
            className="text-sm font-bold text-on-surface-variant hover:text-secondary"
          >
            {t("workspaces.inviteClose")}
          </Link>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {t("workspaces.inviteEmailLabel")}
            </label>
            <input
              type="email"
              required
              placeholder={t("workspaces.inviteEmailPlaceholder")}
              className="mt-1 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {t("workspaces.inviteRoleLabel")}
            </label>
            <select className="mt-1 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20">
              <option>{t("workspaces.inviteRoleEditor")}</option>
              <option>{t("workspaces.inviteRoleAdmin")}</option>
              <option>{t("workspaces.inviteRoleViewer")}</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-secondary-container py-3 text-sm font-bold text-on-secondary-container transition-opacity hover:opacity-90"
          >
            {t("workspaces.inviteSend")}
          </button>
        </form>
      </div>
    </WorkspacePageScaffold>
  );
}
