"use client";

import type { ReactElement } from "react";

import {
  centsToUsd,
  type ReferralRow,
  type WalletTxRow,
  type WithdrawalRow,
} from "@/lib/referral/referralApi";

type Tab = "referrals" | "rewards";

export function ReferralTabs({
  tab,
  setTab,
  referrals,
  txs,
  withdrawals,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  referrals: ReferralRow[];
  txs: WalletTxRow[];
  withdrawals: WithdrawalRow[];
}): ReactElement {
  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTab("referrals")}
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            tab === "referrals"
              ? "bg-on-surface text-surface"
              : "bg-surface-container-low text-on-surface"
          }`}
        >
          My Referrals
        </button>
        <button
          type="button"
          onClick={() => setTab("rewards")}
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            tab === "rewards"
              ? "bg-on-surface text-surface"
              : "bg-surface-container-low text-on-surface"
          }`}
        >
          My Rewards
        </button>
      </div>

      {tab === "referrals" ? (
        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Signup</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Credited</th>
                <th className="px-4 py-3 font-medium">Reward</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-on-surface-variant">
                    Start sharing, your referrals will appear here!
                  </td>
                </tr>
              ) : (
                referrals.map((r, i) => (
                  <tr key={`${r.referred_email_masked}-${i}`} className="border-t border-outline-variant/20">
                    <td className="px-4 py-3">{r.referred_email_masked}</td>
                    <td className="px-4 py-3">
                      {new Date(r.signed_up_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 capitalize">{r.status.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      {r.credited_at
                        ? new Date(r.credited_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {r.reward_cents != null ? centsToUsd(r.reward_cents) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-on-surface-variant">
                      Rewards will show here after your referrals purchase.
                    </td>
                  </tr>
                ) : (
                  txs.map((t) => (
                    <tr key={t.id} className="border-t border-outline-variant/20">
                      <td className="px-4 py-3">{t.type}</td>
                      <td className="px-4 py-3">{centsToUsd(t.amount_cents)}</td>
                      <td className="px-4 py-3">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {t.note || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {withdrawals.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-on-surface">
                Withdrawal requests
              </h3>
              <ul className="space-y-2 text-sm">
                {withdrawals.map((w) => (
                  <li
                    key={w.id}
                    className="rounded-lg border border-outline-variant/30 px-3 py-2"
                  >
                    {centsToUsd(w.amount_cents)} · {w.payout_method} ·{" "}
                    <span className="capitalize">{w.status}</span>
                    {w.payment_reference ? ` · ${w.payment_reference}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
