"use client";

import { MARKETING_NAV } from "@/components/marketing/nav-config";
import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { cn } from "@/lib/cn";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { getStoredAccessToken, POSTSIVA_USER_CHANGED } from "@/lib/auth/session";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeAuth(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(POSTSIVA_USER_CHANGED, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(POSTSIVA_USER_CHANGED, onStoreChange);
  };
}

function getAuthSnapshot(): boolean {
  return Boolean(getStoredAccessToken()?.trim());
}

export function LightFloatingNavbar(): React.ReactElement {
  const { t } = usePublicTranslations();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const authenticated = useSyncExternalStore(subscribeAuth, getAuthSnapshot, () => false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const ctaHref = authenticated ? "/dashboard" : "/signup";
  const ctaLabel = authenticated ? t("marketing.navDashboard") : t("marketing.heroCtaStart");

  const navLinks = MARKETING_NAV.filter((l) => !l.href.includes("#"));

  return (
    <>
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6"
        animate={{ paddingTop: scrolled ? 12 : 24 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.nav
          aria-label={t("marketing.navMainAria")}
          className={cn(
            "pointer-events-auto flex h-[72px] w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-[#181818] px-2 py-2 shadow-xl backdrop-blur-xl sm:gap-3 sm:px-3",
            scrolled ? "max-w-[700px]" : "max-w-[min(900px,calc(100vw-2rem))]",
          )}
          layout
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 pl-1 sm:pl-2">
            <div className="h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full ring-1 ring-[#FAF9F5]/80">
              <PostsivaLogoMark size={34} priority className="h-full w-full" />
            </div>
            <span className="hidden truncate text-sm font-bold text-[#FAF9F5] sm:inline">
              Post<span className="text-[#7dd3fc]">siva</span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex lg:gap-2">
            {navLinks.map((link) => (
              "external" in link && link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF9F5]/75 transition-colors duration-300 hover:text-[#FAF9F5] lg:text-[11px]"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 lg:text-[11px]",
                    pathname === link.href || pathname.startsWith(`${link.href}/`)
                      ? "bg-white/15 text-[#FAF9F5]"
                      : "text-[#FAF9F5]/75 hover:text-[#FAF9F5]",
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              )
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 pr-0.5 sm:gap-2">
            <PublicLanguageSwitcher compact className="hidden sm:inline-flex [&_button]:text-[#FAF9F5]/80" />
            {!authenticated ? (
              <Link
                href="/login"
                className="hidden rounded-full px-3 py-2 text-xs font-semibold text-[#FAF9F5]/80 transition-colors hover:text-[#FAF9F5] md:inline"
                suppressHydrationWarning
              >
                {t("marketing.navLogin")}
              </Link>
            ) : null}
            <Link
              href={ctaHref}
              className="inline-flex h-10 items-center rounded-full bg-[#FAF9F5] px-4 text-xs font-bold uppercase tracking-wide text-[#181818] transition-transform hover:scale-[1.02] sm:h-11 sm:px-6 sm:text-[11px]"
              suppressHydrationWarning
            >
              {ctaLabel}
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? t("marketing.navCloseMenu") : t("marketing.navOpenMenu")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#FAF9F5] md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label={t("marketing.navCloseMenu")}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed left-4 right-4 top-[5.5rem] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-[#D9D7D0] bg-[#FAF9F5] p-4 shadow-2xl md:hidden"
            >
              <div className="mb-3">
                <PublicLanguageSwitcher compact />
              </div>
              {navLinks.map((link) => (
                "external" in link && link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl px-3 py-3 text-sm font-semibold text-[#1B1B1B] hover:bg-[#F0EFEB]"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl px-3 py-3 text-sm font-semibold text-[#1B1B1B] hover:bg-[#F0EFEB]"
                    onClick={() => setOpen(false)}
                  >
                    {t(link.labelKey)}
                  </Link>
                )
              ))}
              {!authenticated ? (
                <Link
                  href="/login"
                  className="mt-1 block rounded-xl px-3 py-3 text-sm font-semibold text-[#8C8880]"
                  onClick={() => setOpen(false)}
                >
                  {t("marketing.navLogin")}
                </Link>
              ) : null}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
