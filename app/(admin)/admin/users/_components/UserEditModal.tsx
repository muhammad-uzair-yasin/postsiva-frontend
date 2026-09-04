"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { AdminUser, AdminUserUpdate } from "@/lib/admin/usersApi";

import { ModalShell } from "./ModalShell";

interface UserEditModalProps {
  user: AdminUser;
  onSave: (update: AdminUserUpdate) => Promise<void>;
  onClose: () => void;
}

/** Edit modal — profile fields plus admin / developer role toggles. */
export function UserEditModal({ user, onSave, onClose }: UserEditModalProps) {
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [isAdmin, setIsAdmin] = useState(user.is_admin);
  const [isDeveloper, setIsDeveloper] = useState(user.is_developer ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const update: AdminUserUpdate = {};
    if (fullName.trim() !== (user.full_name ?? "")) {
      update.full_name = fullName.trim();
    }
    if (username.trim() !== (user.username ?? "")) {
      update.username = username.trim();
    }
    if (isAdmin !== user.is_admin) update.is_admin = isAdmin;
    if (isDeveloper !== (user.is_developer ?? false)) {
      update.is_developer = isDeveloper;
    }
    if (Object.keys(update).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(update);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Edit user" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="truncate text-sm text-on-surface-variant">{user.email}</p>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
            Full name
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
            className="w-full rounded-xl border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
            Username
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />
        </label>
        <fieldset className="space-y-2 rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-3">
          <legend className="px-1 text-xs font-semibold text-on-surface-variant">
            Access
          </legend>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="rounded border-outline-variant"
            />
            Admin (full admin panel access)
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={isDeveloper}
              onChange={(e) => setIsDeveloper(e.target.checked)}
              className="rounded border-outline-variant"
            />
            Developer (beta features)
          </label>
        </fieldset>
        {error ? (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-on-error-container">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
