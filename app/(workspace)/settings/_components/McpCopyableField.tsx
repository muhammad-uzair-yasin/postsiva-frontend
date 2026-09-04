"use client";

import type { ReactElement } from "react";

type McpCopyableFieldProps = {
  label: string;
  value: string;
  copyId: string;
  copiedKey: string;
  copiedLabel: string;
  copyBusy?: boolean;
  multiline?: boolean;
  onCopy: (value: string, copyId: string) => void;
};

export function McpCopyableField({
  label,
  value,
  copyId,
  copiedKey,
  copiedLabel,
  copyBusy,
  multiline = false,
  onCopy,
}: McpCopyableFieldProps): ReactElement {
  const active = copiedKey === copyId;
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
        <button
          type="button"
          disabled={copyBusy}
          onClick={() => onCopy(value, copyId)}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold disabled:opacity-50 ${
            active ? "bg-secondary/20 text-secondary" : "text-primary hover:bg-primary/10"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {active ? "check" : "content_copy"}
          </span>
          {active ? copiedLabel : "Copy"}
        </button>
      </div>
      {multiline ? (
        <p className="rounded-lg border border-outline-variant/10 bg-surface-container-high/70 px-2.5 py-2 text-[11px] leading-4 text-on-surface-variant">
          {value}
        </p>
      ) : (
        <code className="block break-all rounded-lg border border-outline-variant/10 bg-surface-container-high/70 px-2.5 py-2 font-mono text-[11px] leading-4 text-on-surface">
          {value}
        </code>
      )}
    </div>
  );
}
