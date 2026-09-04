"use client";

import type { ReactElement } from "react";

import { centsToUsd, type ReferralMe } from "@/lib/referral/referralApi";

export function ReferralStatsRow({ me }: { me: ReferralMe }): ReactElement {
  const cards = [
    { label: "Signups", value: String(me.stats.signups) },
    { label: "Purchased", value: String(me.stats.purchased) },
    { label: "Credited", value: String(me.stats.credited) },
    { label: "Wallet", value: centsToUsd(me.wallet.available_cents) },
    { label: "Paid out", value: centsToUsd(me.wallet.lifetime_paid_cents) },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-outline-variant/30 bg-surface px-4 py-4"
        >
          <p className="text-xs text-on-surface-variant">{c.label}</p>
          <p className="mt-1 text-xl font-semibold text-on-surface">{c.value}</p>
        </div>
      ))}
      <div className="col-span-2 rounded-xl border border-outline-variant/30 bg-surface px-4 py-4 sm:col-span-3 lg:col-span-5">
        <p className="text-xs text-on-surface-variant">Pro milestone</p>
        <p className="mt-1 text-sm text-on-surface">
          {me.milestone.awarded
            ? me.milestone.pro_grant_ends_at
              ? `Unlocked — Pro grant until ${new Date(me.milestone.pro_grant_ends_at).toLocaleDateString()}`
              : "Unlocked (already on Pro or grant recorded)"
            : `${me.milestone.credited_count} / ${me.milestone.required_credited} credited referrals`}
        </p>
      </div>
    </div>
  );
}
