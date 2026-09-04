"use client";

import { useMemo, useState } from "react";
import { Loader2, Send, X } from "lucide-react";

import {
  ADMIN_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_CATEGORIES,
  filterEmailTemplates,
  type AdminEmailTemplate,
  type EmailTemplateCategory,
} from "@/lib/admin/emailTemplates";
import { userDisplayName } from "@/lib/admin/usersApi";

import type { UserEmailTarget } from "../_hooks/useUserEmail";

const NOTE_MAX = 1000;

export function UserEmailModal({
  target,
  sending,
  error,
  onCancel,
  onSend,
}: {
  target: UserEmailTarget;
  sending: boolean;
  error: string | null;
  onCancel: () => void;
  onSend: (template: AdminEmailTemplate, customNote: string) => void;
}) {
  const [category, setCategory] = useState<EmailTemplateCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [templateId, setTemplateId] = useState(ADMIN_EMAIL_TEMPLATES[0]?.id ?? "");
  const [customNote, setCustomNote] = useState("");

  const filtered = useMemo(
    () => filterEmailTemplates(category, query),
    [category, query],
  );
  const selected =
    ADMIN_EMAIL_TEMPLATES.find((t) => t.id === templateId) ??
    filtered[0] ??
    ADMIN_EMAIL_TEMPLATES[0];

  const recipientCount = target.kind === "bulk" ? target.userIds.length : 1;
  const recipientLabel =
    target.kind === "single"
      ? `${target.user.email} (${userDisplayName(target.user)})`
      : `${recipientCount} selected user(s)`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Send follow-up email"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !sending) onCancel();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/15 p-5">
          <div>
            <h3 className="text-base font-bold text-on-surface">Send follow-up email</h3>
            <p className="mt-0.5 text-xs text-on-surface-variant">{recipientLabel}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={chipClass(category === "all")}
            >
              All ({ADMIN_EMAIL_TEMPLATES.length})
            </button>
            {EMAIL_TEMPLATE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={chipClass(category === c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />

          <label className="block text-sm font-medium text-on-surface">
            Template
            <select
              value={selected?.id ?? ""}
              onChange={(e) => setTemplateId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm text-on-surface"
            >
              {filtered.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.subject.slice(0, 48)}
                  {t.subject.length > 48 ? "…" : ""}
                </option>
              ))}
            </select>
          </label>

          {selected ? (
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-sm">
              <p className="font-semibold text-on-surface">{selected.subject}</p>
              <p className="mt-2 whitespace-pre-wrap text-on-surface-variant">
                {selected.body}
              </p>
            </div>
          ) : null}

          <label className="block text-sm font-medium text-on-surface">
            Extra note (optional)
            <textarea
              rows={3}
              maxLength={NOTE_MAX}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Appended below the template body."
              className="mt-1.5 w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-error-container/40 px-3 py-2 text-xs text-error">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-outline-variant/15 p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sending || !selected}
            onClick={() => selected && onSend(selected, customNote)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send to {recipientCount}
          </button>
        </div>
      </div>
    </div>
  );
}

function chipClass(active: boolean): string {
  return active
    ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
    : "rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high";
}
