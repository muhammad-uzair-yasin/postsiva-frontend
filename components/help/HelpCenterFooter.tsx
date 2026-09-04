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
      { label: "Contact", href: "/contact" },
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

export function HelpCenterFooter(): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-[#E5E7EB] bg-white pb-10 pt-20">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-4 sm:px-10 md:grid-cols-4 lg:grid-cols-6">
        <div className="col-span-2 mb-8 lg:col-span-2 lg:mb-0">
          <span className="block font-[family-name:var(--font-headline)] text-2xl font-bold text-[#111827]">
            Post<span className="text-[#0058bc]">siva</span>
          </span>
          <p className="mt-4 text-sm text-[#4B5563]">
            © {year} Postsiva Social OS. All rights reserved.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <span className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#111827]">
              {column.title}
            </span>
            {column.links.map((link) => {
              const className =
                "text-sm text-[#4B5563] underline-offset-2 transition-colors duration-300 hover:text-[#0058bc] hover:underline";
              if ("external" in link && link.external) {
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
        ))}
      </div>
    </footer>
  );
}
