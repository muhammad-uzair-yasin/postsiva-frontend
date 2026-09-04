"use client";

import { useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";

import { userDisplayName, type AdminUser } from "@/lib/admin/usersApi";

import { ModalShell } from "./ModalShell";

interface UserDeleteModalProps {
  user: AdminUser;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Destructive confirm for DELETE /admin/api/users/{id}. */
export function UserDeleteModal({
  user,
  onConfirm,
  onClose,
}: UserDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
      setDeleting(false);
    }
  };

  return (
    <ModalShell title="Delete user" onClose={onClose}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-container text-on-error-container">
          <TriangleAlert className="h-5 w-5" />
        </span>
        <p className="text-sm text-on-surface-variant">
          Are you sure you want to permanently delete{" "}
          <strong className="text-on-surface">{userDisplayName(user)}</strong> (
          {user.email})? All of their data will be removed. This action cannot
          be undone.
        </p>
      </div>
      {error ? (
        <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-xl bg-error-container px-4 py-2 text-sm font-semibold text-on-error-container transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Delete user
        </button>
      </div>
    </ModalShell>
  );
}
