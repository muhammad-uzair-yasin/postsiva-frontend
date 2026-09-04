"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";

import { getStoredAccessToken, getStoredUser } from "@/lib/auth/session";
import {
  adminMarkWithdrawalPaid,
  centsToUsd,
  fetchAdminWithdrawals,
  type WithdrawalRow,
} from "@/lib/referral/referralApi";

export function ReferralAdminWithdrawals(): ReactElement | null {
  const user = getStoredUser();
  const [items, setItems] = useState<WithdrawalRow[]>([]);
  const [refById, setRefById] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.is_admin) return;
    const token = getStoredAccessToken();
    if (!token) return;
    try {
      const res = await fetchAdminWithdrawals(token, "pending");
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Admin load failed");
    }
  }, [user?.is_admin]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user?.is_admin) return null;

  async function markPaid(id: string) {
    const token = getStoredAccessToken();
    if (!token) return;
    const payment_reference = (refById[id] || "").trim();
    if (!payment_reference) {
      setError("Payment reference required");
      return;
    }
    await adminMarkWithdrawalPaid(token, id, payment_reference);
    await load();
  }

  return (
    <section className="rounded-xl border border-dashed border-outline-variant/50 p-4">
      <h3 className="text-sm font-semibold text-on-surface">Admin — pending withdrawals</h3>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-on-surface-variant">No pending requests.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((w) => (
            <li key={w.id} className="rounded-lg bg-surface-container-low p-3 text-sm">
              <p>
                {w.user_email || w.id} · {centsToUsd(w.amount_cents)} · {w.payout_method}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {JSON.stringify(w.payout_details)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  placeholder="Payment reference"
                  value={refById[w.id] || ""}
                  onChange={(e) =>
                    setRefById((prev) => ({ ...prev, [w.id]: e.target.value }))
                  }
                  className="min-w-[180px] flex-1 rounded border border-outline-variant/40 px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void markPaid(w.id)}
                  className="rounded bg-on-surface px-3 py-1.5 text-xs font-medium text-surface"
                >
                  Mark paid
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
