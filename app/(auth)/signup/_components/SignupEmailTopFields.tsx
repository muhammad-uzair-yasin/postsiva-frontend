"use client";

import { useState } from "react";

import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

export interface SignupEmailTopFieldsProps {
  firstName: string;
  setFirstName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  isLoading: boolean;
}

export function SignupEmailTopFields({
  firstName,
  setFirstName,
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
}: SignupEmailTopFieldsProps): React.ReactElement {
  const { t } = usePublicTranslations();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="space-y-2">
        <label
          className="mb-1.5 ml-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300"
          htmlFor="firstname"
        >
          {t("auth.firstName")}
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="material-symbols-outlined text-lg text-[#9ca3af] transition-colors group-focus-within:text-[#0058bc]">
              badge
            </span>
          </div>
          <input
            className="w-full rounded-lg border border-white/15 bg-white py-3 pl-11 pr-4 text-[#181c23] placeholder:text-[#9ca3af] shadow-sm transition-all focus:border-[#0058bc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0058bc] disabled:opacity-60"
            id="firstname"
            name="firstname"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(ev) => setFirstName(ev.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>
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
              alternate_email
            </span>
          </div>
          <input
            className="w-full rounded-lg border border-white/15 bg-white py-3 pl-11 pr-4 text-[#181c23] placeholder:text-[#9ca3af] shadow-sm transition-all focus:border-[#0058bc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0058bc] disabled:opacity-60"
            id="email"
            name="email"
            placeholder={t("auth.emailPlaceholder")}
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label
          className="mb-1.5 ml-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300"
          htmlFor="password"
        >
          {t("auth.password")}
        </label>
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
            required
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
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
    </>
  );
}
