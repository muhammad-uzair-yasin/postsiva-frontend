"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Loader2, Trash2 } from "lucide-react";

import { adminGet, adminSend } from "@/lib/admin/adminFetch";
import {
  GRANT_MONTH_PRESETS,
  GRANTABLE_PLANS,
  buildPlanGrantPath,
  formatGrantExpiry,
  type AdminPlanGrantStatus,
  type GrantablePlanId,
} from "@/lib/admin/planGrantApi";
import { userDisplayName, type AdminUserWithActivity } from "@/lib/admin/usersApi";

export function UserPlanGrantModal({
  user,
  onClose,
  onUpdated,
}: {
  user: AdminUserWithActivity;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState<AdminPlanGrantStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<GrantablePlanId>("starter");
  const [months, setMonths] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminGet<AdminPlanGrantStatus>(buildPlanGrantPath(user.id))
      .then((res) => {
        setStatus(res);
        if (res.active && res.plan_id === "pro") setPlanId("pro");
        if (res.active && res.months_granted) setMonths(res.months_granted);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load plan grant");
        setLoading(false);
      });
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const grant = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await adminSend<AdminPlanGrantStatus>(
        "POST",
        buildPlanGrantPath(user.id),
        { plan_id: planId, months },
      );
      setStatus(res);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant plan");
    } finally {
      setSaving(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm("Cancel this admin plan grant and revert the user to Free?")) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await adminSend<AdminPlanGrantStatus>(
        "DELETE",
        buildPlanGrantPath(user.id),
      );
      setStatus(res);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel plan grant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Manage plan grant"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-on-surface">Plan grant</h3>
            <p className="truncate text-sm text-on-surface-variant">{user.email}</p>
            <p className="text-xs text-on-surface-variant">{userDisplayName(user)}</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <>
            {status?.active ? (
              <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
                <p className="font-semibold text-on-surface">
                  Active: {(status.plan_id || "—").toUpperCase()} (admin-granted)
                </p>
                <p className="mt-1 text-on-surface-variant">
                  Expires {formatGrantExpiry(status.expires_at)}
                  {status.months_granted ? ` · ${status.months_granted} mo granted` : ""}
                </p>
                {status.granted_by_email ? (
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Granted by {status.granted_by_email}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-on-surface-variant">
                No active admin plan. Grant Starter or Pro for a fixed number of months.
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
                  Plan
                </span>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value as GrantablePlanId)}
                  disabled={saving}
                  className="w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm"
                >
                  {GRANTABLE_PLANS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
                  Months
                </span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value) || 1)}
                  disabled={saving}
                  className="w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {GRANT_MONTH_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={saving}
                  onClick={() => setMonths(m)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    months === m
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {m} mo
                </button>
              ))}
            </div>
          </>
        )}

        {error ? (
          <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-on-error-container">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-outline-variant/25 px-4 py-2 text-sm font-semibold text-on-surface"
          >
            Close
          </button>
          {status?.active ? (
            <button
              type="button"
              onClick={cancel}
              disabled={saving || loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-error-container px-4 py-2 text-sm font-semibold text-on-error-container disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Cancel grant
            </button>
          ) : null}
          <button
            type="button"
            onClick={grant}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {status?.active ? "Replace grant" : "Activate plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
