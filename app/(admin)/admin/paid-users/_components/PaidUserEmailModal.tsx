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
import { paidUserDisplayName } from "@/lib/admin/paidUsersApi";

import type { PaidUserEmailTarget } from "../_hooks/usePaidUserEmail";

const NOTE_MAX = 1000;

export function PaidUserEmailModal({
  target,
  sending,
  error,
  onCancel,
  onSend,
}: {
  target: PaidUserEmailTarget;
  sending: boolean;
  error: string | null;
  onCancel: () => void;
  onSend: (template: AdminEmailTemplate, customNote: string) => void;
}) {
  const [category, setCategory] = useState<EmailTemplateCategory | "all">("payment");
  const [query, setQuery] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [customNote, setCustomNote] = useState("");

  const filtered = useMemo(
    () => filterEmailTemplates(category, query),
    [category, query],
  );
  const selected =
    ADMIN_EMAIL_TEMPLATES.find((t) => t.id === templateId) ??
    filtered[0] ??
    ADMIN_EMAIL_TEMPLATES.find((t) => t.category === "payment") ??
    ADMIN_EMAIL_TEMPLATES[0];

  const recipientCount = target.kind === "bulk" ? target.userIds.length : 1;
  const recipientLabel =
    target.kind === "single"
      ? `${target.user.email} (${paidUserDisplayName(target.user)})`
      : `${recipientCount} selected user(s)`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Send billing email"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !sending) onCancel();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/15 p-5">
          <div>
            <h3 className="text-base font-bold text-on-surface">Send billing email</h3>
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
              className={`rounded-full px-3 py-1 text-xs font-medium ${category === "all" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}
            >
              All
            </button>
            {EMAIL_TEMPLATE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${category === c.id ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            placeholder="Search templates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm"
          />

          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplateId(t.id)}
                className={`rounded-xl border p-3 text-left text-xs ${selected?.id === t.id ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:bg-surface-container-high"}`}
              >
                <div className="font-semibold text-on-surface">{t.name}</div>
                <div className="mt-0.5 text-on-surface-variant">{t.subject}</div>
              </button>
            ))}
          </div>

          {selected ? (
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-3 text-xs">
              <p className="font-semibold text-on-surface">Preview</p>
              <p className="mt-1 text-on-surface-variant">{selected.body}</p>
            </div>
          ) : null}

          <label className="block text-xs font-medium text-on-surface-variant">
            Custom note (optional)
            <textarea
              value={customNote}
              maxLength={NOTE_MAX}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm text-on-surface"
            />
          </label>
          {error ? <p className="text-xs text-error">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-outline-variant/15 p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sending || !selected}
            onClick={() => selected && onSend(selected, customNote)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
