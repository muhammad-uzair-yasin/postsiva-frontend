"use client";

import Link from "next/link";

import {
  POSTSIVA_PRIVACY_POLICY_URL,
  POSTSIVA_TERMS_OF_SERVICE_URL,
} from "@/lib/legalLinks";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Integrations", href: "/features" },
      { label: "API", href: "/docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/contact" },
      { label: "Blog", href: "/help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: POSTSIVA_PRIVACY_POLICY_URL, external: true },
      { label: "Terms of Service", href: POSTSIVA_TERMS_OF_SERVICE_URL, external: true },
      { label: "Security", href: POSTSIVA_PRIVACY_POLICY_URL, external: true },
    ],
  },
] as const;

export function LightContactFooter(): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-outline-variant/50 bg-surface-container-lowest pb-10 pt-20">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-4 sm:px-10 md:grid-cols-4 lg:grid-cols-6">
        <div className="col-span-2 lg:col-span-2">
          <span className="mb-4 block font-[family-name:var(--font-headline)] text-2xl font-bold text-on-surface">
            Postsiva
          </span>
          <p className="mb-6 max-w-xs text-sm text-on-surface-variant">
            The command center for your professional social presence.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="mb-4 font-mono text-xs font-medium uppercase text-on-surface">
              {column.title}
            </h4>
            <ul className="space-y-3">
              {column.links.map((link) => {
                const className =
                  "text-sm text-on-surface-variant underline-offset-2 transition-all duration-300 hover:text-primary hover:underline";
                if ("external" in link && link.external) {
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={link.label}>
                    <Link href={link.href} className={className}>
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-[1280px] flex-col items-center justify-between border-t border-outline-variant/30 px-4 pt-8 sm:px-10 md:flex-row">
        <p className="text-sm text-on-surface-variant">
          © {year} Postsiva Social OS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
