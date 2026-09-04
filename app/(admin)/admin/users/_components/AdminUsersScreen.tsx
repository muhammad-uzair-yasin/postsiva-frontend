"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { userDisplayName, type AdminUserWithActivity } from "@/lib/admin/usersApi";

import { useAdminUsers } from "../_hooks/useAdminUsers";
import { useUserEmail } from "../_hooks/useUserEmail";
import { UserDeleteModal } from "./UserDeleteModal";
import { UserEditModal } from "./UserEditModal";
import { UserEmailModal } from "./UserEmailModal";
import { UserPlanGrantModal } from "./UserPlanGrantModal";
import { UsersPeriodFilter } from "./UsersPeriodFilter";
import { UsersTable } from "./UsersTable";

interface Notice {
  kind: "success" | "error";
  text: string;
}

/** Enhanced users admin — filters, activity, roles, templated emails. */
export function AdminUsersScreen() {
  const {
    users,
    loading,
    loadingMore,
    loadingAll,
    error,
    hasMore,
    search,
    period,
    periodCounts,
    sortKey,
    sortDir,
    setSearch,
    setPeriod,
    setSort,
    reload,
    loadMore,
    setUserActive,
    updateUserProfile,
    deleteUser,
    impersonateUser,
  } = useAdminUsers();
  const email = useUserEmail();

  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserWithActivity | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserWithActivity | null>(null);
  const [planUser, setPlanUser] = useState<AdminUserWithActivity | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleToggleActive = async (user: AdminUserWithActivity) => {
    setBusyUserId(user.id);
    setNotice(null);
    try {
      await setUserActive(user.id, !user.is_active);
      setNotice({
        kind: "success",
        text: `${userDisplayName(user)} ${user.is_active ? "deactivated" : "activated"}.`,
      });
    } catch (err) {
      setNotice({
        kind: "error",
        text: err instanceof Error ? err.message : "Failed to update user",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleImpersonate = async (user: AdminUserWithActivity) => {
    setBusyUserId(user.id);
    setNotice(null);
    try {
      const url = await impersonateUser(user.id);
      window.open(url, "_blank", "noopener,noreferrer");
      setNotice({
        kind: "success",
        text: `Opened the app as ${user.email} in a new tab.`,
      });
    } catch (err) {
      setNotice({
        kind: "error",
        text: err instanceof Error ? err.message : "Impersonation failed",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleEmailSend = async (
    template: Parameters<typeof email.send>[0],
    customNote: string,
  ) => {
    const ok = await email.send(template, customNote);
    if (ok) setSelected([]);
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Users</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage accounts, activity, roles, and follow-up emails
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => email.openBulk(selected)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-bold text-on-primary"
            >
              <Mail className="h-4 w-4" />
              Email {selected.length} selected
            </button>
          ) : null}
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3.5 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-5">
        <UsersPeriodFilter value={period} onChange={setPeriod} counts={periodCounts} />
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, username, or name…"
          className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-low py-2.5 pl-9 pr-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-primary"
        />
      </div>

      {email.lastResult ? (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm">
          <span className="flex items-start gap-2 whitespace-pre-wrap text-on-surface">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {email.lastResult}
          </span>
          <button type="button" onClick={email.dismissResult} className="rounded-lg p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {notice ? (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
            notice.kind === "success"
              ? "border border-outline-variant/20 bg-surface-container-low text-on-surface"
              : "bg-error-container text-on-error-container"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low py-16 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading users…
          </div>
        ) : error && users.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            <span>Error loading users: {error}</span>
            <button type="button" onClick={reload} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low py-16 text-center">
            <Users className="h-10 w-10 text-on-surface-variant/40" />
            <p className="text-sm text-on-surface-variant">
              {search.trim() || period !== "all"
                ? "No users match your filters."
                : "No users found."}
            </p>
          </div>
        ) : (
          <>
            <UsersTable
              users={users}
              busyUserId={busyUserId}
              selected={selected}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={setSort}
              onSelectedChange={setSelected}
              onToggleActive={handleToggleActive}
              onEdit={setEditingUser}
              onDelete={setDeletingUser}
              onImpersonate={handleImpersonate}
              onEmail={email.openSingle}
              onManagePlan={setPlanUser}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-on-surface-variant">
                Showing {users.length} user{users.length === 1 ? "" : "s"}
                {loadingAll ? " — loading full list…" : ""}
                {hasMore && period !== "week" && period !== "month" ? " (load more for full list)" : ""}
              </p>
              {hasMore && period !== "week" && period !== "month" ? (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3.5 py-2 text-sm font-semibold text-on-surface disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Load more
                </button>
              ) : null}
            </div>
            {error ? (
              <p className="mt-2 rounded-xl bg-error-container px-3 py-2 text-sm text-on-error-container">
                {error}
              </p>
            ) : null}
          </>
        )}
      </div>

      {editingUser ? (
        <UserEditModal
          user={editingUser}
          onSave={(update) => updateUserProfile(editingUser.id, update)}
          onClose={() => setEditingUser(null)}
        />
      ) : null}
      {deletingUser ? (
        <UserDeleteModal
          user={deletingUser}
          onConfirm={async () => {
            await deleteUser(deletingUser.id);
            setNotice({
              kind: "success",
              text: `${userDisplayName(deletingUser)} deleted.`,
            });
          }}
          onClose={() => setDeletingUser(null)}
        />
      ) : null}
      {email.target ? (
        <UserEmailModal
          target={email.target}
          sending={email.sending}
          error={email.error}
          onCancel={email.close}
          onSend={handleEmailSend}
        />
      ) : null}
      {planUser ? (
        <UserPlanGrantModal
          user={planUser}
          onClose={() => setPlanUser(null)}
          onUpdated={reload}
        />
      ) : null}
    </div>
  );
}
