"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "Platform", href: "/features" },
  { label: "Solutions", href: "/made-for/creators" },
  { label: "Resources", href: "/help" },
  { label: "API docs", href: "https://docs.postsiva.com/introduction", external: true },
  { label: "Pricing", href: "/pricing" },
] as const;

export function HelpCenterHeader(): React.ReactElement {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="h-9 w-9 overflow-hidden rounded-xl">
            <PostsivaLogoMark size={36} priority className="h-full w-full" />
          </div>
          <span className="font-[family-name:var(--font-headline)] text-xl font-bold tracking-tight text-[#111827]">
            Post<span className="text-[#0058bc]">siva</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Help center site navigation"
        >
          {NAV_LINKS.map((link) => {
            const external = "external" in link && link.external;
            const active =
              external
                ? false
                : link.href === "/help"
                ? pathname === "/help" || pathname.startsWith("/help/")
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const className = cn(
              "text-sm font-medium transition-colors duration-200",
              active
                ? "border-b-2 border-[#0058bc] pb-0.5 font-semibold text-[#0058bc]"
                : "text-[#4B5563] hover:text-[#0058bc]",
            );

            return external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <PublicLanguageSwitcher compact className="hidden sm:inline-flex" />
          <Link
            href="/signup"
            className="hidden items-center justify-center rounded-xl bg-[#0058bc] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#004a9e] active:scale-[0.98] md:inline-flex"
          >
            Get Started
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#111827] md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          className="border-t border-[#E5E7EB] bg-white/95 px-4 py-4 md:hidden"
          aria-label="Mobile help center navigation"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                {"external" in link && link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#4B5563] hover:bg-[#EFF6FF] hover:text-[#111827]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#4B5563] hover:bg-[#EFF6FF] hover:text-[#111827]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/signup"
                className="mt-2 block rounded-xl bg-[#0058bc] px-3 py-2.5 text-center text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
