"use client";

import { useEffect, useState } from "react";

import { getLinkedInLoginUrl } from "@/lib/auth/linkedinLogin";
import { storePostAuthNextPath } from "@/lib/auth/getPostAuthPath";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

const linkClassName =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-[#e0e2ed] bg-[#F9FAFB] px-4 py-3 font-semibold text-[#181c23] transition-colors duration-200 hover:bg-[#eef0fc]";

export function LinkedInSignInButton(): React.ReactElement {
  const { t } = usePublicTranslations();
  const [href, setHref] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setHref(getLinkedInLoginUrl()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const icon = (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#0A66C2"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.062 2.062 0 0 1 2.063-2.063 2.062 2.062 0 0 1 2.063 2.063 2.062 2.062 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );

  if (!href) {
    return (
      <button
        type="button"
        disabled
        className={`${linkClassName} pointer-events-none opacity-60`}
      >
        {icon}
        {t("auth.continueLinkedIn")}
      </button>
    );
  }

  return (
    <a
      href={href}
      className={linkClassName}
      rel="noopener noreferrer"
      onClick={() => {
        storePostAuthNextPath(
          new URLSearchParams(window.location.search).get("next"),
        );
      }}
    >
      {icon}
      {t("auth.continueLinkedIn")}
    </a>
  );
}
