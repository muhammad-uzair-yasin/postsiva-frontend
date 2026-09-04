"use client";

import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

export interface ResetPasswordReadyFormProps {
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function ResetPasswordReadyForm({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  isLoading,
  onSubmit,
}: ResetPasswordReadyFormProps): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <>
      <header className="mb-8 text-center lg:text-left">
        <h1 className="mb-2 font-[family-name:var(--font-headline)] text-3xl font-semibold tracking-tight text-white">
          {t("auth.resetTitle")}
        </h1>
        <p className="text-sm leading-6 text-slate-300">{t("auth.resetSubtitle")}</p>
      </header>
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        {error ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div className="space-y-2">
          <label
            className="mb-1.5 ml-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300"
            htmlFor="new-password"
          >
            {t("auth.newPassword")}
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="material-symbols-outlined text-lg text-[#9ca3af] transition-colors group-focus-within:text-[#0058bc]">
                lock
              </span>
            </div>
            <input
              className="w-full rounded-lg border border-white/15 bg-white py-3 pl-11 pr-4 text-[#181c23] placeholder:text-[#9ca3af] shadow-sm transition-all focus:border-[#0058bc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0058bc] disabled:opacity-60"
              id="new-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label
            className="mb-1.5 ml-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300"
            htmlFor="confirm-password"
          >
            {t("auth.confirmPassword")}
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="material-symbols-outlined text-lg text-[#9ca3af] transition-colors group-focus-within:text-[#0058bc]">
                lock
              </span>
            </div>
            <input
              className="w-full rounded-lg border border-white/15 bg-white py-3 pl-11 pr-4 text-[#181c23] placeholder:text-[#9ca3af] shadow-sm transition-all focus:border-[#0058bc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0058bc] disabled:opacity-60"
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          className="mt-2 w-full rounded-xl bg-[#0058bc] py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#004493] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? t("auth.saving") : t("auth.savePassword")}
        </button>
      </form>
    </>
  );
}
