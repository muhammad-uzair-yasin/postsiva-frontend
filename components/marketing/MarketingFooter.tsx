"use client";

import Link from "next/link";

import { MARKETING_NAV } from "@/components/marketing/nav-config";
import { MARKETING_SOCIAL_LINKS } from "@/components/marketing/marketingSocialLinks";
import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import {
  POSTSIVA_PRIVACY_POLICY_URL,
  POSTSIVA_REFERRAL_POLICY_URL,
  POSTSIVA_REFUND_POLICY_URL,
  POSTSIVA_TERMS_OF_SERVICE_URL,
} from "@/lib/legalLinks";

const EXTRA_SOCIAL_ICON_SRC: Record<"whatsapp" | "mastodon", string> = {
  whatsapp: "https://cdn.simpleicons.org/whatsapp/25D366",
  mastodon: "https://cdn.simpleicons.org/mastodon/6364FF",
};

function isBrandIconId(
  icon: (typeof MARKETING_SOCIAL_LINKS)[number]["icon"],
): icon is SocialPlatformIconId {
  return icon !== "mastodon" && icon !== "whatsapp";
}

export function MarketingFooter(): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <footer className="border-t border-white/10 bg-surface-container-lowest/90 py-14">
      <div className="marketing-container flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
              <PostsivaLogoMark size={44} className="h-full w-full" />
            </div>
            <p className="text-lg font-bold text-on-surface">
              Post<span className="text-primary">siva</span>
            </p>
          </div>
          <p className="mt-3 max-w-sm text-sm text-on-surface-variant">
            {t("marketing.footerTagline")}
          </p>
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {t("marketing.footerFollow")}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {MARKETING_SOCIAL_LINKS.map(({ label, href, icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:border-primary/40 hover:bg-primary/10"
                >
                  {isBrandIconId(icon) ? (
                    <SocialPlatformIcon
                      platform={icon}
                      className="h-5 w-5"
                      alt=""
                    />
                  ) : (
                    <img
                      src={EXTRA_SOCIAL_ICON_SRC[icon]}
                      alt=""
                      className="h-5 w-5 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {t("marketing.footerProduct")}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-on-surface">
              {MARKETING_NAV.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-primary"
                  >
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {t("marketing.footerApp")}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-on-surface">
              <li>
                <Link href="/login" className="transition-colors hover:text-primary">
                  {t("marketing.navLogin")}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-primary">
                  {t("marketing.navSignup")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {t("marketing.footerLegal")}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-on-surface">
              <li>
                <Link
                  href={POSTSIVA_TERMS_OF_SERVICE_URL}
                  className="transition-colors hover:text-primary"
                >
                  {t("marketing.footerTerms")}
                </Link>
              </li>
              <li>
                <Link
                  href={POSTSIVA_PRIVACY_POLICY_URL}
                  className="transition-colors hover:text-primary"
                >
                  {t("marketing.footerPrivacy")}
                </Link>
              </li>
              <li>
                <Link
                  href={POSTSIVA_REFUND_POLICY_URL}
                  className="transition-colors hover:text-primary"
                >
                  {t("marketing.footerRefund")}
                </Link>
              </li>
              <li>
                <Link
                  href={POSTSIVA_REFERRAL_POLICY_URL}
                  className="transition-colors hover:text-primary"
                >
                  {t("marketing.footerReferral")}
                </Link>
              </li>
              <li>
                <span className="text-on-surface-variant">
                  © {new Date().getFullYear()} Postsiva
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
