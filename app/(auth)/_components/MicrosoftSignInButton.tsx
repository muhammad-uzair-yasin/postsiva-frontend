"use client";

import { useEffect, useState } from "react";

import { getMicrosoftLoginUrl } from "@/lib/auth/microsoftLogin";
import { storePostAuthNextPath } from "@/lib/auth/getPostAuthPath";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

const linkClassName =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-[#e0e2ed] bg-[#F9FAFB] px-4 py-3 font-semibold text-[#181c23] transition-colors duration-200 hover:bg-[#eef0fc]";

export function MicrosoftSignInButton(): React.ReactElement {
  const { t } = usePublicTranslations();
  const [href, setHref] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setHref(getMicrosoftLoginUrl()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const icon = (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
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
        {t("auth.continueMicrosoft")}
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
      {t("auth.continueMicrosoft")}
    </a>
  );
}
