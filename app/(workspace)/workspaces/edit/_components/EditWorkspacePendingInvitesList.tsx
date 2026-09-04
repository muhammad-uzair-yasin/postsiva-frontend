"use client";

import type { PendingWorkspaceInviteRow } from "@/lib/workspaces/workspaceMembersApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface EditWorkspacePendingInvitesListProps {
  loading: boolean;
  pendingInvites: PendingWorkspaceInviteRow[];
  busyInviteId: string | null;
  onResend: (inviteId: string) => void;
}

function formatExpiry(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EditWorkspacePendingInvitesList({
  loading,
  pendingInvites,
  busyInviteId,
  onResend,
}: EditWorkspacePendingInvitesListProps): React.ReactElement {
  const { t } = useTranslations();

  if (loading) {
    return (
      <p className="text-sm text-on-surface-variant">
        {t("workspaces.teamPendingLoading")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        {t("workspaces.teamPendingTitle")}
      </h3>
      {pendingInvites.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          {t("workspaces.teamPendingEmpty")}
        </p>
      ) : null}
      {pendingInvites.length > 0 ? (
      <ul className="space-y-2">
        {pendingInvites.map((inv) => {
          const expiryLabel = formatExpiry(inv.expires_at);
          const statusLabel = inv.expired
            ? t("workspaces.teamInviteExpired")
            : t("workspaces.teamInvitePending");
          const busy = busyInviteId === inv.id;
          return (
            <li
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-low/40 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">
                  {inv.email}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {inv.role_name}
                  {expiryLabel
                    ? ` · ${t("workspaces.teamInviteExpires", { date: expiryLabel })}`
                    : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={
                    inv.expired
                      ? "rounded-full bg-error/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-error"
                      : "rounded-full bg-tertiary-container/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-on-surface-variant"
                  }
                >
                  {statusLabel}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onResend(inv.id)}
                  className="rounded-lg border border-primary/40 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? t("workspaces.teamInviteResending") : t("workspaces.teamInviteResend")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      ) : null}
    </div>
  );
}
