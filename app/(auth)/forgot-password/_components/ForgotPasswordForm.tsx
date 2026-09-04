"use client";

import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

import { useForgotPasswordForm } from "../_hooks/useForgotPasswordForm";

export function ForgotPasswordForm(): React.ReactElement {
  const { t } = usePublicTranslations();
  const { email, setEmail, error, isLoading, submitted, tryAgain, onSubmit } =
    useForgotPasswordForm();

  if (submitted) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl border border-sky-300/25 bg-sky-400/10 px-4 py-4 text-sm text-slate-100"
          role="status"
        >
          {t("auth.forgotSent")}
        </div>
        <p className="text-center text-sm text-slate-300">
          {t("auth.wrongEmail")}{" "}
          <button
            type="button"
            className="font-bold text-sky-300 hover:text-sky-200 hover:underline"
            onClick={tryAgain}
          >
            {t("auth.tryAgain")}
          </button>
        </p>
      </div>
    );
  }

  return (
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
          htmlFor="forgot-email"
        >
          {t("auth.email")}
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="material-symbols-outlined text-lg text-[#9ca3af] transition-colors group-focus-within:text-[#0058bc]">
              mail
            </span>
          </div>
          <input
            className="w-full rounded-lg border border-white/15 bg-white py-3 pl-11 pr-4 text-[#181c23] placeholder:text-[#9ca3af] shadow-sm transition-all focus:border-[#0058bc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0058bc] disabled:opacity-60"
            id="forgot-email"
            name="email"
            placeholder={t("auth.emailPlaceholder")}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
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
        {isLoading ? t("auth.sending") : t("auth.sendReset")}
      </button>
    </form>
  );
}
