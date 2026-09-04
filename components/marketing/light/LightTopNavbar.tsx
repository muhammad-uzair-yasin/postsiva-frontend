"use client";

import { MARKETING_NAV } from "@/components/marketing/nav-config";
import { LP_PRIMARY, LP_PRIMARY_CONTAINER, lightGlowAccent } from "@/components/marketing/light/light-tokens";
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

export function LightTopNavbar(): React.ReactElement {
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
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 sm:pt-6"
        animate={{ paddingTop: scrolled ? 12 : 20 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.nav
          aria-label={t("marketing.navMainAria")}
          className={cn(
            "pointer-events-auto flex h-14 w-full max-w-[min(920px,calc(100vw-2rem))] items-center justify-between gap-2 rounded-full px-2 py-1.5 shadow-[0_8px_32px_rgba(0,88,188,0.35)] backdrop-blur-md sm:h-[60px] sm:gap-3 sm:px-3",
            scrolled && "shadow-[0_12px_40px_rgba(0,88,188,0.4)]",
          )}
          style={{
            background: `linear-gradient(135deg, ${LP_PRIMARY} 0%, ${LP_PRIMARY_CONTAINER} 100%)`,
          }}
          layout
          transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 pl-1 sm:pl-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/90 sm:h-10 sm:w-10">
              <PostsivaLogoMark size={40} priority className="h-full w-full object-cover" />
            </div>
            <span className="hidden text-sm font-bold text-white sm:inline">Postsiva</span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex lg:gap-2">
            {navLinks.map((link) => (
              "external" in link && link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-white/85 transition-colors duration-200 hover:text-white lg:px-4"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 lg:px-4",
                    pathname === link.href || pathname.startsWith(`${link.href}/`)
                      ? "bg-white/15 text-white"
                      : "text-white/85 hover:text-white",
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              )
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 pr-0.5 sm:gap-2">
            <PublicLanguageSwitcher compact className="hidden sm:inline-flex [&_button]:text-white/85 [&_button:hover]:text-white" />
            {!authenticated ? (
              <Link
                href="/login"
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white md:inline"
                suppressHydrationWarning
              >
                {t("marketing.navLogin")}
              </Link>
            ) : null}
            <Link
              href={ctaHref}
              className={cn(
                "inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#0058bc] transition-transform hover:scale-[1.02] sm:h-10 sm:px-5",
                lightGlowAccent,
              )}
              suppressHydrationWarning
            >
              {ctaLabel}
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? t("marketing.navCloseMenu") : t("marketing.navOpenMenu")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white md:hidden"
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
              className="fixed inset-0 z-40 bg-[#0058bc]/20 backdrop-blur-[2px] md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed left-4 right-4 top-[5rem] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-[#d8e2ff] bg-white p-4 shadow-2xl md:hidden"
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
                    className="block rounded-xl px-3 py-3 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB]"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl px-3 py-3 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB]"
                    onClick={() => setOpen(false)}
                  >
                    {t(link.labelKey)}
                  </Link>
                )
              ))}
              {!authenticated ? (
                <Link
                  href="/login"
                  className="mt-1 block rounded-xl px-3 py-3 text-sm font-medium text-[#4B5563]"
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
