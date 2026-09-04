"use client";

import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  LogIn,
  Mail,
  Minus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  CreditCard,
} from "lucide-react";

import { planDisplayLabel } from "@/lib/admin/planGrantApi";

import {
  formatActivityCount,
  formatUserDate,
  userDisplayName,
  userRoleLabel,
  type AdminUserWithActivity,
  type SortDirection,
  type UserSortKey,
} from "@/lib/admin/usersApi";

interface UsersTableProps {
  users: AdminUserWithActivity[];
  busyUserId: string | null;
  selected: string[];
  sortKey: UserSortKey;
  sortDir: SortDirection;
  onSort: (key: UserSortKey) => void;
  onSelectedChange: (next: string[]) => void;
  onToggleActive: (user: AdminUserWithActivity) => void;
  onEdit: (user: AdminUserWithActivity) => void;
  onDelete: (user: AdminUserWithActivity) => void;
  onImpersonate: (user: AdminUserWithActivity) => void;
  onEmail: (user: AdminUserWithActivity) => void;
  onManagePlan: (user: AdminUserWithActivity) => void;
}

const ACTION_BTN =
  "rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40";

function SortBtn({
  label,
  columnKey,
  activeKey,
  direction,
  align,
  onSort,
}: {
  label: string;
  columnKey: UserSortKey;
  activeKey: UserSortKey;
  direction: SortDirection;
  align: "left" | "right";
  onSort: (key: UserSortKey) => void;
}) {
  return (
    <th
      className={
        align === "left"
          ? "px-4 py-3 text-left"
          : "px-4 py-3 text-right"
      }
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
      >
        {label}
        {activeKey === columnKey ? (
          direction === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : null}
      </button>
    </th>
  );
}

/** Users table with activity metrics, selection, and row actions. */
export function UsersTable({
  users,
  busyUserId,
  selected,
  sortKey,
  sortDir,
  onSort,
  onSelectedChange,
  onToggleActive,
  onEdit,
  onDelete,
  onImpersonate,
  onEmail,
  onManagePlan,
}: UsersTableProps) {
  const allSelected =
    users.length > 0 && users.every((u) => selected.includes(u.id));

  return (
    <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-surface-container-low">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() =>
                  onSelectedChange(allSelected ? [] : users.map((u) => u.id))
                }
                className="rounded border-outline-variant"
              />
            </th>
            <SortBtn label="User" columnKey="email" activeKey={sortKey} direction={sortDir} align="left" onSort={onSort} />
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Role</th>
            <SortBtn label="Activity" columnKey="activity_score" activeKey={sortKey} direction={sortDir} align="right" onSort={onSort} />
            <SortBtn label="Published" columnKey="post_published_count" activeKey={sortKey} direction={sortDir} align="right" onSort={onSort} />
            <SortBtn label="API hits" columnKey="api_route_hits_total" activeKey={sortKey} direction={sortDir} align="right" onSort={onSort} />
            <th className="px-4 py-3">Verified</th>
            <SortBtn label="Joined" columnKey="created_at" activeKey={sortKey} direction={sortDir} align="left" onSort={onSort} />
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const busy = busyUserId === user.id;
            const a = user.activity;
            return (
              <tr
                key={user.id}
                className="border-t border-outline-variant/15 transition-colors hover:bg-surface-container-high/40"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => {
                      onSelectedChange(
                        selected.includes(user.id)
                          ? selected.filter((id) => id !== user.id)
                          : [...selected, user.id],
                      );
                    }}
                    className="rounded border-outline-variant"
                  />
                </td>
                <td className="max-w-56 px-4 py-3">
                  <p className="truncate font-medium text-on-surface">{user.email}</p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {userDisplayName(user)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {user.is_active ? (
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-error-container px-2.5 py-0.5 text-xs font-semibold text-on-error-container">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.plan?.admin_grant_active
                        ? "bg-tertiary-container text-on-tertiary-container"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {planDisplayLabel(user.plan)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.is_admin ? (
                    <span className="inline-block rounded-full bg-secondary-container px-2.5 py-0.5 text-xs font-semibold text-on-secondary-container">
                      Admin
                    </span>
                  ) : user.is_developer ? (
                    <span className="inline-block rounded-full bg-tertiary-container px-2.5 py-0.5 text-xs font-semibold text-on-tertiary-container">
                      Dev
                    </span>
                  ) : (
                    <span className="text-xs text-on-surface-variant">
                      {userRoleLabel(user)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-on-surface">
                  {formatActivityCount(a.activity_score)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-on-surface-variant">
                  {formatActivityCount(a.post_published_count)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-on-surface-variant">
                  {formatActivityCount(a.api_route_hits_total)}
                </td>
                <td className="px-4 py-3">
                  {user.email_verified ? (
                    <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified" />
                  ) : (
                    <Minus className="h-4 w-4 text-on-surface-variant/50" aria-label="Unverified" />
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                  {formatUserDate(user.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-0.5">
                    <button
                      type="button"
                      onClick={() => onManagePlan(user)}
                      disabled={busy}
                      title="Grant or cancel plan"
                      className={ACTION_BTN}
                    >
                      <CreditCard className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEmail(user)}
                      disabled={busy}
                      title="Send follow-up email"
                      className={ACTION_BTN}
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onImpersonate(user)}
                      disabled={busy || !user.is_active}
                      title={user.is_active ? "Login as user" : "Inactive users cannot be impersonated"}
                      className={ACTION_BTN}
                    >
                      <LogIn className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(user)}
                      disabled={busy}
                      title={user.is_active ? "Deactivate" : "Activate"}
                      className={ACTION_BTN}
                    >
                      {user.is_active ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      disabled={busy}
                      title="Edit user"
                      className={ACTION_BTN}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      disabled={busy}
                      title="Delete user"
                      className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
