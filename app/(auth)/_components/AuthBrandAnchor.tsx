"use client";

import Link from "next/link";
import Image from "next/image";

import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { POSTSIVA_LOGO_SRC } from "@/lib/brandAssets";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

type AuthTone = "light" | "dark";

type AuthToneProps = {
  readonly tone?: AuthTone;
};

export function AuthBrandAnchor({ tone = "light" }: AuthToneProps): React.ReactElement {
  const { t } = usePublicTranslations();
  const dark = tone === "dark";

  return (
    <div className="absolute left-6 top-6 z-10 flex items-center gap-3 sm:left-10 sm:top-10">
      <Link
        href="/"
        className={`inline-flex items-center gap-2 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#0058bc] focus-visible:ring-offset-2 ${
          dark ? "focus-visible:ring-offset-[#07162e]" : "focus-visible:ring-offset-white"
        }`}
        aria-label={t("auth.backHomeAria")}
      >
        <Image
          alt=""
          className="h-9 w-9 rounded-xl object-cover"
          src={POSTSIVA_LOGO_SRC}
          width={36}
          height={36}
        />
        <span
          className={`font-[family-name:var(--font-headline)] text-xl font-bold tracking-tight ${
            dark ? "text-white" : "text-[#0058bc]"
          }`}
        >
          Postsiva
        </span>
      </Link>
    </div>
  );
}

export function AuthPanelLanguageSwitcher(): React.ReactElement {
  return (
    <div className="absolute right-6 top-6 z-10 sm:right-10 sm:top-10">
      <PublicLanguageSwitcher compact />
    </div>
  );
}

export function AuthSystemStatus({ tone = "light" }: AuthToneProps): React.ReactElement {
  const dark = tone === "dark";

  return (
    <div className="pointer-events-none absolute bottom-6 left-6 hidden items-center gap-2 sm:bottom-10 sm:left-10 sm:flex">
      <span className="h-2 w-2 rounded-full bg-[#10B981]" />
      <span
        className={`font-mono text-[11px] font-semibold uppercase tracking-[0.16em] ${
          dark ? "text-slate-400" : "text-[#717786]"
        }`}
      >
        System Operational
      </span>
    </div>
  );
}
