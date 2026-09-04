"use client";

import { useEffect, useState } from "react";

import { getTiktokLoginUrl } from "@/lib/auth/tiktokLogin";
import { storePostAuthNextPath } from "@/lib/auth/getPostAuthPath";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

const linkClassName =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-[#e0e2ed] bg-[#F9FAFB] px-4 py-3 font-semibold text-[#181c23] transition-colors duration-200 hover:bg-[#eef0fc]";

export function TikTokSignInButton(): React.ReactElement {
  const { t } = usePublicTranslations();
  const [href, setHref] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setHref(getTiktokLoginUrl()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const icon = (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.3v12.86a2.59 2.59 0 1 1-1.83-2.48V9.98a5.9 5.9 0 1 0 5.16 5.85V9.01a7.55 7.55 0 0 0 4.42 1.42V7.12a4.28 4.28 0 0 1-3.4-1.3z"
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
        {t("auth.continueTiktok")}
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
      {t("auth.continueTiktok")}
    </a>
  );
}
