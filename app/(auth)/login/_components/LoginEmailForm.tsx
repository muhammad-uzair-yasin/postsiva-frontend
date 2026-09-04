"use client";

import Link from "next/link";
import { useState } from "react";

import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

import { useLoginForm } from "../_hooks/useLoginForm";

export function LoginEmailForm(): React.ReactElement {
  const { t } = usePublicTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    onSubmit,
  } = useLoginForm();

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
          htmlFor="email"
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
            id="email"
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
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label
            className="block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300"
            htmlFor="password"
          >
            {t("auth.password")}
          </label>
          <Link
            className="text-xs font-bold text-sky-300 transition-colors hover:text-sky-200"
            href="/forgot-password"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="material-symbols-outlined text-lg text-[#9ca3af] transition-colors group-focus-within:text-[#0058bc]">
              lock
            </span>
          </div>
          <input
            className="w-full rounded-lg border border-white/15 bg-white py-3 pl-11 pr-12 text-[#181c23] placeholder:text-[#9ca3af] shadow-sm transition-all focus:border-[#0058bc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0058bc] disabled:opacity-60"
            id="password"
            name="password"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#717786] transition-colors hover:text-[#181c23] disabled:opacity-50"
            onClick={() => {
              setShowPassword((v) => !v);
            }}
            disabled={isLoading}
            aria-pressed={showPassword}
          >
            <span className="material-symbols-outlined text-lg">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>
      <button
        className="mt-4 w-full rounded-xl bg-[#0058bc] py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#004493] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? t("auth.signingIn") : t("auth.signIn")}
      </button>
    </form>
  );
}
