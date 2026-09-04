"use client";

import Link from "next/link";

import {
  POSTSIVA_PRIVACY_POLICY_URL,
  POSTSIVA_TERMS_OF_SERVICE_URL,
} from "@/lib/legalLinks";

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: POSTSIVA_PRIVACY_POLICY_URL, external: true },
  { label: "Terms of Service", href: POSTSIVA_TERMS_OF_SERVICE_URL, external: true },
  { label: "Security", href: POSTSIVA_PRIVACY_POLICY_URL, external: true },
  { label: "Status", href: "https://status.postsiva.com", external: true },
  { label: "API Docs", href: "/docs", external: false },
] as const;

export function LightPricingFooter(): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-outline-variant bg-surface-container-lowest py-12">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 sm:px-10 md:grid-cols-2">
        <div>
          <Link
            href="/"
            className="mb-4 block font-[family-name:var(--font-headline)] text-2xl font-bold text-primary"
          >
            Postsiva
          </Link>
          <p className="text-sm text-on-surface-variant">
            © {year} Postsiva AI. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-end">
          {FOOTER_LINKS.map((link) => {
            const className =
              "text-sm text-on-surface-variant underline-offset-2 transition-all hover:text-primary hover:underline";
            if (link.external) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link key={link.label} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
