"use client";

import { useState, type ReactElement } from "react";

import { centsToUsd } from "@/lib/referral/referralApi";

const METHODS = [
  "paypal",
  "wise",
  "payoneer",
  "usdt",
  "easypaisa",
  "jazzcash",
  "bank",
] as const;

export function ReferralWithdrawForm({
  canWithdraw,
  minCents,
  availableCents,
  onSubmit,
}: {
  canWithdraw: boolean;
  minCents: number;
  availableCents: number;
  onSubmit: (input: {
    amount_cents: number;
    payout_method: string;
    payout_details: Record<string, string>;
  }) => Promise<void>;
}): ReactElement {
  const [method, setMethod] = useState<string>("paypal");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      await onSubmit({
        amount_cents: availableCents,
        payout_method: method,
        payout_details: { details: details.trim() },
      });
      setMsg("Withdrawal requested. We’ll process it manually.");
      setDetails("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  if (!canWithdraw) {
    return (
      <p className="text-sm text-on-surface-variant">
        Withdrawals unlock at {centsToUsd(minCents)}. Available:{" "}
        {centsToUsd(availableCents)}.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-xl border border-outline-variant/30 bg-surface p-4"
    >
      <h3 className="text-sm font-semibold text-on-surface">Request withdrawal</h3>
      <p className="mt-1 text-sm text-on-surface-variant">
        Amount: {centsToUsd(availableCents)} (full available balance)
      </p>
      <label className="mt-3 block text-xs text-on-surface-variant">
        Payout method
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-3 block text-xs text-on-surface-variant">
        Payout details (email, wallet, phone, bank)
        <textarea
          required
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="mt-4 rounded-lg bg-on-surface px-4 py-2.5 text-sm font-medium text-surface disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Submit withdrawal"}
      </button>
      {msg ? <p className="mt-2 text-sm text-on-surface-variant">{msg}</p> : null}
    </form>
  );
}
