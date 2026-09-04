import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { parseApiErrorBody } from "@/lib/api/parseApiError";

export type ReferralMe = {
  code: string;
  share_url: string;
  rewards: { starter_cents: number; pro_cents: number };
  milestone: {
    required_credited: number;
    credited_count: number;
    awarded: boolean;
    pro_grant_ends_at: string | null;
  };
  wallet: {
    available_cents: number;
    pending_withdraw_cents: number;
    lifetime_earned_cents: number;
    lifetime_paid_cents: number;
    min_withdraw_cents: number;
  };
  stats: { signups: number; purchased: number; credited: number };
};

export type ReferralRow = {
  referred_email_masked: string;
  status: string;
  signed_up_at: string;
  purchased_at: string | null;
  credited_at: string | null;
  reward_cents: number | null;
  reward_plan: string | null;
};

export type WalletTxRow = {
  id: string;
  type: string;
  amount_cents: number;
  status: string;
  note: string | null;
  created_at: string;
};

export type WithdrawalRow = {
  id: string;
  amount_cents: number;
  payout_method: string;
  payout_details: Record<string, unknown>;
  status: string;
  payment_reference: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string | null;
};

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    throw new Error(parseApiErrorBody(body) || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function fetchReferralMe(token: string): Promise<ReferralMe> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/referral/me`,
    token,
    authHeaders,
  );
  return readJson(res);
}

export async function fetchReferralList(
  token: string,
): Promise<{ items: ReferralRow[]; total: number }> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/referral/referrals`,
    token,
    authHeaders,
  );
  return readJson(res);
}

export async function fetchReferralTransactions(
  token: string,
): Promise<{ items: WalletTxRow[]; total: number }> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/referral/transactions`,
    token,
    authHeaders,
  );
  return readJson(res);
}

export async function fetchMyWithdrawals(
  token: string,
): Promise<{ items: WithdrawalRow[]; total: number }> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/referral/withdrawals`,
    token,
    authHeaders,
  );
  return readJson(res);
}

export async function createWithdrawalRequest(
  token: string,
  body: {
    amount_cents: number;
    payout_method: string;
    payout_details: Record<string, string>;
  },
): Promise<WithdrawalRow> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/referral/withdrawals`,
    token,
    authHeaders,
    { method: "POST", body: JSON.stringify(body) },
  );
  return readJson(res);
}

export async function fetchAdminWithdrawals(
  token: string,
  status?: string,
): Promise<{ items: WithdrawalRow[]; total: number }> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/referral/admin/withdrawals${q}`,
    token,
    authHeaders,
  );
  return readJson(res);
}

export async function adminMarkWithdrawalPaid(
  token: string,
  id: string,
  payment_reference: string,
): Promise<WithdrawalRow> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/referral/admin/withdrawals/${id}/mark-paid`,
    token,
    authHeaders,
    { method: "POST", body: JSON.stringify({ payment_reference }) },
  );
  return readJson(res);
}

export function centsToUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
