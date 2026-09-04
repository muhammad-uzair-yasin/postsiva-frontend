"use client";

import {
  formatSentAt,
  type EmailKindRow,
  type EmailRecentRow,
} from "@/lib/admin/emailsApi";

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-6 text-center text-sm text-on-surface-variant"
      >
        {label}
      </td>
    </tr>
  );
}

const HEAD_CELL =
  "px-3 py-2.5 font-semibold text-[11px] uppercase tracking-wider text-on-surface-variant";

/** Sends per email_kind (legacy emails.html "By kind" table). */
export function EmailsByKindTable({ rows }: { rows: EmailKindRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[24rem] text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className={`${HEAD_CELL} text-left`}>Kind</th>
            <th className={`${HEAD_CELL} text-right`}>Sends</th>
            <th className={`${HEAD_CELL} text-right`}>Unique recipients</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={3} label="No emails in this period yet" />
          ) : (
            rows.map((r) => (
              <tr key={r.email_kind} className="border-t border-outline-variant/10">
                <td className="break-all px-3 py-2.5 font-mono text-xs">{r.email_kind}</td>
                <td className="px-3 py-2.5 text-right font-semibold">
                  {(r.send_count ?? 0).toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {(r.unique_recipient_emails ?? 0).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Recent outbound sends (legacy emails.html "Recent" table). */
export function RecentEmailsTable({ rows }: { rows: EmailRecentRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[56rem] text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className={`${HEAD_CELL} text-left`}>Sent (UTC)</th>
            <th className={`${HEAD_CELL} text-left`}>Kind</th>
            <th className={`${HEAD_CELL} text-left`}>To</th>
            <th className={`${HEAD_CELL} text-left`}>User id</th>
            <th className={`${HEAD_CELL} text-left`}>Admin</th>
            <th className={`${HEAD_CELL} text-left`}>Subject</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={6} label="No rows" />
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t border-outline-variant/10">
                <td className="whitespace-nowrap px-3 py-2.5 text-xs">
                  {formatSentAt(r.sent_at)}
                </td>
                <td className="break-all px-3 py-2.5 font-mono text-xs">{r.email_kind}</td>
                <td className="break-all px-3 py-2.5 text-xs">{r.recipient_email}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-on-surface-variant">
                  {r.recipient_user_id ?? "—"}
                </td>
                <td className="break-all px-3 py-2.5 text-xs">{r.admin_email ?? "—"}</td>
                <td className="break-all px-3 py-2.5 text-xs text-on-surface-variant">
                  {r.subject_snippet ?? "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
