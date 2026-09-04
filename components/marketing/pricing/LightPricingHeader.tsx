"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Integrations", href: "/features" },
  { label: "Workspaces", href: "/made-for/marketing-teams" },
  { label: "Pricing", href: "/pricing" },
] as const;

export function LightPricingHeader(): React.ReactElement {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="h-8 w-8 overflow-hidden rounded-lg">
            <PostsivaLogoMark size={32} priority className="h-full w-full" />
          </div>
          <span className="font-[family-name:var(--font-headline)] text-lg font-bold text-primary">
            Postsiva
          </span>
        </Link>

        <nav className="hidden items-center md:flex" aria-label="Pricing site navigation">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors duration-200",
                  active
                    ? "border-b-2 border-primary pb-1 font-bold text-primary"
                    : "text-on-surface-variant hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <PublicLanguageSwitcher compact className="hidden sm:inline-flex" />
          <Link
            href="/login"
            className="hidden font-mono text-xs font-medium uppercase tracking-wide text-primary transition-colors hover:text-[#004a9e] md:inline"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-xl bg-primary px-6 py-3 font-mono text-xs font-medium uppercase tracking-wide text-on-primary shadow-[0_4px_14px_0_rgba(0,88,188,0.39)] transition-all hover:-translate-y-0.5 hover:bg-[#004a9e] hover:shadow-[0_6px_20px_rgba(0,88,188,0.23)] md:inline-flex"
          >
            Get Started
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center text-on-surface-variant md:hidden"
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
          className="border-t border-outline-variant/30 bg-surface/95 px-4 py-4 md:hidden"
          aria-label="Mobile pricing navigation"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex gap-2 pt-2">
              <Link
                href="/login"
                className="flex-1 rounded-xl border border-outline-variant/50 py-2.5 text-center text-sm font-semibold text-on-surface"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-on-primary"
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
