"use client";

import { MARKETING_NAV } from "@/components/marketing/nav-config";
import { MARKETING_SOCIAL_LINKS } from "@/components/marketing/marketingSocialLinks";
import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { COMPETITOR_COMPARISONS } from "@/lib/marketing/comparisons";
import {
  POSTSIVA_PRIVACY_POLICY_URL,
  POSTSIVA_REFERRAL_POLICY_URL,
  POSTSIVA_REFUND_POLICY_URL,
  POSTSIVA_TERMS_OF_SERVICE_URL,
} from "@/lib/legalLinks";
import Link from "next/link";

const FOOTER_GRID: readonly {
  titleKey: string;
  links: readonly { labelKey?: string; label?: string; href: string }[];
}[] = [
  {
    titleKey: "marketing.footerProduct",
    links: [
      { labelKey: "marketing.navFeatures", href: "/features" },
      { labelKey: "marketing.navIntegrations", href: "/integrations-explore" },
      { labelKey: "marketing.navPricing", href: "/pricing" },
      { labelKey: "marketing.navHelp", href: "/help" },
    ],
  },
  {
    titleKey: "marketing.lightFooterSolutions",
    links: [
      { labelKey: "marketing.navMadeFor", href: "/made-for/creators" },
      { labelKey: "marketing.lightFooterAgencies", href: "/made-for/agencies" },
      { labelKey: "marketing.lightFooterTeams", href: "/made-for/marketing-teams" },
      { labelKey: "marketing.navContact", href: "/contact" },
    ],
  },
  {
    titleKey: "marketing.lightFooterCompany",
    links: [
      { labelKey: "marketing.navAbout", href: "/about" },
      { labelKey: "marketing.navHelp", href: "/help" },
      { labelKey: "marketing.navContact", href: "/contact" },
      { labelKey: "marketing.navHowItWorks", href: "/how-it-works" },
    ],
  },
  {
    titleKey: "marketing.footerLegal",
    links: [
      { labelKey: "marketing.footerPrivacy", href: POSTSIVA_PRIVACY_POLICY_URL },
      { labelKey: "marketing.footerTerms", href: POSTSIVA_TERMS_OF_SERVICE_URL },
      { labelKey: "marketing.footerRefund", href: POSTSIVA_REFUND_POLICY_URL },
      { labelKey: "marketing.footerReferral", href: POSTSIVA_REFERRAL_POLICY_URL },
    ],
  },
  {
    titleKey: "Compare",
    links: COMPETITOR_COMPARISONS.map(({ name, slug }) => ({
      label: `Postsiva vs. ${name}`,
      href: `/comparisons/${slug}`,
    })),
  },
  {
    titleKey: "marketing.footerFollow",
    links: MARKETING_SOCIAL_LINKS.map(({ label, href }) => ({ label, href })),
  },
  {
    titleKey: "marketing.lightFooterSupport",
    links: [
      { labelKey: "marketing.navHelp", href: "/help" },
      { labelKey: "marketing.lightFooterApiDocs", href: "https://docs.postsiva.com/introduction" },
      { labelKey: "marketing.navContact", href: "/contact" },
    ],
  },
  {
    titleKey: "marketing.lightFooterSecurity",
    links: [],
  },
];

export function LightFooter(): React.ReactElement {
  const { t } = usePublicTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden rounded-t-2xl border-t border-slate-800 bg-slate-900 px-4 pb-20 pt-12 text-[#FAF9F5] sm:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="relative z-10 mx-auto w-full max-w-[1728px]">
        <div className="mx-auto mb-12 flex h-[72px] w-full max-w-[min(1728px,calc(100vw-2rem))] items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-2 py-2 backdrop-blur-md shadow-lg">
          <div className="flex min-w-0 items-center gap-3 pl-1">
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white">
              <PostsivaLogoMark size={34} className="h-full w-full" />
            </div>
            <nav className="hidden items-center gap-5 md:flex">
              {MARKETING_NAV.slice(0, 4).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-semibold uppercase tracking-wider text-white/80 transition-colors hover:text-white"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/signup"
            className="inline-flex h-10 shrink-0 items-center rounded-xl bg-white px-6 text-[11px] font-bold uppercase tracking-wide text-[#181818] transition-colors hover:bg-gray-100"
          >
            {t("marketing.heroCtaStart")}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12 md:grid-cols-4 lg:grid-cols-8">
          {FOOTER_GRID.map((col) => (
            <div key={col.titleKey} className="flex flex-col gap-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
                {col.titleKey.startsWith("marketing.") ? t(col.titleKey) : col.titleKey}
              </p>
              {col.links.map((link) => {
                const label = link.labelKey ? t(link.labelKey) : (link.label ?? "");
                const external = link.href.startsWith("http");
                const className = "text-sm text-white/80 transition-colors hover:text-white";
                if (external) {
                  return (
                    <a
                      key={link.href + label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {label}
                    </a>
                  );
                }
                return (
                  <Link key={link.href + label} href={link.href} className={className}>
                    {label}
                  </Link>
                );
              })}
              {col.titleKey === "marketing.lightFooterSecurity" ? (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  {t("marketing.lightFooterOperational")}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/50">
          <p>
            © {year} Postsiva. {t("marketing.lightFooterRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
