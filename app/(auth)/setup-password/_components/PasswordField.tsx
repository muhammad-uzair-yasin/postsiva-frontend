"use client";

import { useState } from "react";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoComplete?: string;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled = false,
  autoComplete = "new-password",
}: PasswordFieldProps): React.ReactElement {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label
        className="ml-1 block text-sm font-semibold text-on-surface-variant"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <span className="material-symbols-outlined text-lg text-outline transition-colors group-focus-within:text-secondary">
            lock
          </span>
        </div>
        <input
          className="w-full rounded-xl border-0 bg-surface-container-low py-3.5 pl-11 pr-12 text-on-surface placeholder:text-outline transition-all focus:bg-surface-container focus:ring-2 focus:ring-secondary/50 disabled:opacity-60"
          id={id}
          name={id}
          placeholder="••••••••"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={8}
          disabled={disabled}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-outline transition-colors hover:text-on-surface disabled:opacity-50"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <span className="material-symbols-outlined text-lg">
            {visible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}
