"use client";

import { Loader2, X } from "lucide-react";

import {
  atRiskLabel,
  billingSourceLabel,
  eventTypeLabel,
  formatAdminDate,
  paidUserDisplayName,
  type PaidUserDetail,
  type PaidUserRow,
} from "@/lib/admin/paidUsersApi";

export function PaidUserDetailPanel({
  row,
  detail,
  loading,
  onClose,
  onEmail,
  detailError,
}: {
  row: PaidUserRow;
  detail: PaidUserDetail | null;
  loading: boolean;
  detailError: string | null;
  onClose: () => void;
  onEmail: () => void;
}) {
  const history = detail?.payment_history ?? [];

  return (
    <aside className="flex max-h-[calc(100vh-8rem)] w-full flex-col rounded-xl border border-outline-variant/20 bg-surface-container-low lg:w-96 lg:shrink-0">
      <div className="flex items-start justify-between gap-2 border-b border-outline-variant/15 p-4">
        <div>
          <h3 className="text-sm font-bold text-on-surface">{paidUserDisplayName(row)}</h3>
          <p className="text-xs text-on-surface-variant">{row.email}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm">
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Billing
          </h4>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
            <dt className="text-on-surface-variant">Plan</dt>
            <dd className="capitalize text-on-surface">{row.effective_plan_id}</dd>
            <dt className="text-on-surface-variant">Source</dt>
            <dd className="text-on-surface">{billingSourceLabel(row.billing_source)}</dd>
            <dt className="text-on-surface-variant">Status</dt>
            <dd className="capitalize text-on-surface">{row.billing_status.replace(/_/g, " ")}</dd>
            <dt className="text-on-surface-variant">Next renewal</dt>
            <dd className="text-on-surface">{formatAdminDate(row.current_period_end)}</dd>
            <dt className="text-on-surface-variant">First paid</dt>
            <dd className="text-on-surface">{formatAdminDate(row.first_paid_at)}</dd>
            {row.renewal_note ? (
              <>
                <dt className="text-on-surface-variant">Note</dt>
                <dd className="text-on-surface">{row.renewal_note}</dd>
              </>
            ) : null}
          </dl>
          {row.is_at_risk ? (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-xs font-medium text-error">
              At risk: {atRiskLabel(row.at_risk_reason)}
            </p>
          ) : null}
        </section>

        {row.billing_source === "admin" && row.admin_grant.active ? (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Admin grant
            </h4>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
              <dt className="text-on-surface-variant">Granted by</dt>
              <dd className="text-on-surface">{row.admin_grant.granted_by_email ?? "—"}</dd>
              <dt className="text-on-surface-variant">Months</dt>
              <dd className="text-on-surface">{row.admin_grant.months_granted ?? "—"}</dd>
              <dt className="text-on-surface-variant">Granted at</dt>
              <dd className="text-on-surface">{formatAdminDate(row.admin_grant.granted_at)}</dd>
              <dt className="text-on-surface-variant">Expires</dt>
              <dd className="text-on-surface">{formatAdminDate(row.admin_grant.expires_at)}</dd>
            </dl>
          </section>
        ) : null}

        {row.billing_source === "paddle" ? (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Paddle
            </h4>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
              <dt className="text-on-surface-variant">Subscription</dt>
              <dd className="break-all font-mono text-[10px] text-on-surface">
                {row.paddle_subscription_id ?? "—"}
              </dd>
              <dt className="text-on-surface-variant">Customer</dt>
              <dd className="break-all font-mono text-[10px] text-on-surface">
                {row.paddle_customer_id ?? "—"}
              </dd>
              <dt className="text-on-surface-variant">Interval</dt>
              <dd className="capitalize text-on-surface">{row.billing_interval ?? "—"}</dd>
            </dl>
          </section>
        ) : null}

        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Payment history
          </h4>
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-xs text-on-surface-variant">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history…
            </div>
          ) : detailError ? (
            <p className="text-xs text-error">{detailError}</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-on-surface-variant">No billing events yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-lg border border-outline-variant/15 bg-surface-container p-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-on-surface">
                      {eventTypeLabel(ev.event_type)}
                    </span>
                    <span className="shrink-0 text-[10px] text-on-surface-variant">
                      {formatAdminDate(ev.created_at)}
                    </span>
                  </div>
                  {ev.payload && Object.keys(ev.payload).length > 0 ? (
                    <pre className="mt-1.5 max-h-24 overflow-auto whitespace-pre-wrap break-all text-[10px] text-on-surface-variant">
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="border-t border-outline-variant/15 p-4">
        <button
          type="button"
          onClick={onEmail}
          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
        >
          Send billing email
        </button>
      </div>
    </aside>
  );
}
