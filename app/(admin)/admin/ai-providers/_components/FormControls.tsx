"use client";

import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60";

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-xs font-semibold text-on-surface-variant"
    >
      {children}
    </label>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={inputClass}
    >
      {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function ProbeButton({
  onClick,
  disabled,
  busy,
  icon: Icon,
  children,
  tone = "primary",
}: {
  onClick: () => void;
  disabled: boolean;
  busy: boolean;
  icon: LucideIcon;
  children: React.ReactNode;
  tone?: "primary" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border border-error/40 bg-surface-container-lowest text-error hover:bg-error/10"
      : "bg-primary text-on-primary hover:bg-primary/90";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 ${toneClass}`}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}
