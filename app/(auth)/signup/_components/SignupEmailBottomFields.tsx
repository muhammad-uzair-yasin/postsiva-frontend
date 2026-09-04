"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import {
  POSTSIVA_PRIVACY_POLICY_URL,
  POSTSIVA_TERMS_OF_SERVICE_URL,
} from "@/lib/legalLinks";

export interface SignupEmailBottomFieldsProps {
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  isLoading: boolean;
}

export function SignupEmailBottomFields({
  termsAccepted,
  setTermsAccepted,
  isLoading,
}: SignupEmailBottomFieldsProps): React.ReactElement {
  const { t } = usePublicTranslations();
  const next = useSearchParams().get("next");

  return (
    <>
      <div className="flex items-start gap-3 py-2">
        <input
          className="mt-1 rounded border-white/20 bg-white text-[#0058bc] focus:ring-[#0058bc] focus:ring-offset-[#07162e] disabled:opacity-60"
          id="terms"
          name="terms"
          type="checkbox"
          checked={termsAccepted}
          onChange={(ev) => setTermsAccepted(ev.target.checked)}
          disabled={isLoading}
        />
        <label
          className="text-xs leading-tight text-slate-300"
          htmlFor="terms"
        >
          {t("auth.acceptTerms")} (
          <Link className="text-sky-300 hover:text-sky-200 hover:underline" href={POSTSIVA_TERMS_OF_SERVICE_URL}>
            {t("auth.terms")}
          </Link>
          {" · "}
          <Link className="text-sky-300 hover:text-sky-200 hover:underline" href={POSTSIVA_PRIVACY_POLICY_URL}>
            {t("auth.privacy")}
          </Link>
          )
        </label>
      </div>
      <button
        className="mt-4 w-full rounded-xl bg-[#0058bc] py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#004493] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? t("auth.creatingAccount") : t("auth.createAccountCta")}
      </button>
      <p className="mt-8 text-center text-sm text-slate-300">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link
          className="font-bold text-sky-300 hover:text-sky-200 hover:underline"
          href={next ? `/login?${new URLSearchParams({ next }).toString()}` : "/login"}
        >
          {t("auth.signInLink")}
        </Link>
      </p>
    </>
  );
}
