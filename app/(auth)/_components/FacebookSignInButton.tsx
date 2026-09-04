"use client";

import { useEffect, useState } from "react";

import { getFacebookLoginUrl } from "@/lib/auth/facebookLogin";
import { storePostAuthNextPath } from "@/lib/auth/getPostAuthPath";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

const linkClassName =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-[#e0e2ed] bg-[#F9FAFB] px-4 py-3 font-semibold text-[#181c23] transition-colors duration-200 hover:bg-[#eef0fc]";

export function FacebookSignInButton(): React.ReactElement {
  const { t } = usePublicTranslations();
  const [href, setHref] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setHref(getFacebookLoginUrl()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const icon = (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
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
        {t("auth.continueFacebook")}
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
      {t("auth.continueFacebook")}
    </a>
  );
}
