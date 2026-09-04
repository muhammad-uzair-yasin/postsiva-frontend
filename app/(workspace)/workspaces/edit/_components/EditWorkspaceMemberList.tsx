"use client";

import type { WorkspaceMemberRow } from "@/lib/workspaces/workspaceMembersApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface EditWorkspaceMemberListProps {
  loading: boolean;
  listError: string | null;
  members: WorkspaceMemberRow[];
}

export function EditWorkspaceMemberList({
  loading,
  listError,
  members,
}: EditWorkspaceMemberListProps): React.ReactElement {
  const { t } = useTranslations();

  if (listError) {
    return (
      <p className="text-sm text-error" role="alert">
        {listError}
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-on-surface-variant">{t("workspaces.teamMembersLoading")}</p>
    );
  }

  return (
    <div className="space-y-2 rounded-xl bg-surface-container-low/50 p-4">
      {members.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          {t("workspaces.teamMembersEmpty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.user_id}
              className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low/80 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">
                  {m.email}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-primary">
                  {m.role_name}
                </span>
                <span
                  className="rounded-full border border-outline-variant/50 bg-surface-container-high/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-on-surface-variant"
                  title={t("workspaces.teamMemberActiveTitle")}
                >
                  {t("workspaces.teamMemberActive")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
