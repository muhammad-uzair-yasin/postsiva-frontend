"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken } from "@/lib/auth/session";
import {
  createWithdrawalRequest,
  fetchMyWithdrawals,
  fetchReferralList,
  fetchReferralMe,
  fetchReferralTransactions,
  type ReferralMe,
  type ReferralRow,
  type WalletTxRow,
  type WithdrawalRow,
} from "@/lib/referral/referralApi";

export function useReferralDashboard() {
  const [me, setMe] = useState<ReferralMe | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [txs, setTxs] = useState<WalletTxRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"referrals" | "rewards">("referrals");

  const reload = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setError("Not signed in");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [m, r, t, w] = await Promise.all([
        fetchReferralMe(token),
        fetchReferralList(token),
        fetchReferralTransactions(token),
        fetchMyWithdrawals(token),
      ]);
      setMe(m);
      setReferrals(r.items);
      setTxs(t.items);
      setWithdrawals(w.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load referral data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const submitWithdraw = useCallback(
    async (input: {
      amount_cents: number;
      payout_method: string;
      payout_details: Record<string, string>;
    }) => {
      const token = getStoredAccessToken();
      if (!token) throw new Error("Not signed in");
      await createWithdrawalRequest(token, input);
      await reload();
    },
    [reload],
  );

  return {
    me,
    referrals,
    txs,
    withdrawals,
    loading,
    error,
    tab,
    setTab,
    reload,
    submitWithdraw,
  };
}
