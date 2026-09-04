"use client";

import { cn } from "@/lib/cn";
import { MARKETING_NAV } from "@/components/marketing/nav-config";
import { MarketingFeaturesMegaMenu } from "@/components/marketing/MarketingFeaturesMegaMenu";
import { MarketingIntegrationsMegaMenu } from "@/components/marketing/MarketingIntegrationsMegaMenu";
import { MarketingMadeForMegaMenu } from "@/components/marketing/MarketingMadeForMegaMenu";
import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { getStoredAccessToken, POSTSIVA_USER_CHANGED } from "@/lib/auth/session";

const FEATURES_HREF = "/features";
const INTEGRATIONS_HREF = "/integrations-explore";
const MADE_FOR_HREF = "/made-for";

type MegaMenuKey = "features" | "integrations" | "made-for";

function subscribeMarketingAuth(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(POSTSIVA_USER_CHANGED, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(POSTSIVA_USER_CHANGED, onStoreChange);
  };
}

function getMarketingAuthSnapshot(): boolean {
  return Boolean(getStoredAccessToken()?.trim());
}

function getMarketingAuthServerSnapshot(): boolean {
  return false;
}

function megaKeyForHref(href: string): MegaMenuKey | null {
  if (href === FEATURES_HREF) return "features";
  if (href === INTEGRATIONS_HREF) return "integrations";
  if (href === MADE_FOR_HREF) return "made-for";
  return null;
}

export function MarketingNavbar(): React.ReactElement {
  const { t } = usePublicTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [desktopMega, setDesktopMega] = useState<MegaMenuKey | null>(null);
  const [mobileMega, setMobileMega] = useState<MegaMenuKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const authenticated = useSyncExternalStore(
    subscribeMarketingAuth,
    getMarketingAuthSnapshot,
    getMarketingAuthServerSnapshot,
  );
  const reduceMotion = useReducedMotion();
  const featuresMenuId = useId();
  const integrationsMenuId = useId();
  const madeForMenuId = useId();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (scrolled) setDesktopMega(null);
  }, [scrolled]);

  useEffect(() => {
    setOpen(false);
    setDesktopMega(null);
    setMobileMega(null);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const openMega = (key: MegaMenuKey): void => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setDesktopMega(key);
  };

  const scheduleCloseMega = (): void => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setDesktopMega(null), 140);
  };

  const ctaHref = authenticated ? "/dashboard" : "/signup";
  const ctaLabel = authenticated ? t("marketing.navDashboard") : t("marketing.navSignup");
  const ctaLabelShort = authenticated
    ? t("marketing.navDashboardShort")
    : t("marketing.heroCtaStart");

  const showDesktopNav = true;
  const isMadeForRoute = pathname.startsWith("/made-for");

  const megaMenuId = (key: MegaMenuKey): string => {
    if (key === "features") return featuresMenuId;
    if (key === "integrations") return integrationsMenuId;
    return madeForMenuId;
  };

  const megaMenuLabel = (key: MegaMenuKey): string => {
    if (key === "features") return t("marketing.navFeatures");
    if (key === "integrations") return t("marketing.navIntegrations");
    return t("marketing.navMadeFor");
  };

  const megaMenuWidth = (): string => "w-[min(960px,calc(100vw-2rem))]";

  const renderMegaContent = (
    key: MegaMenuKey,
    onNavigate: () => void,
    className?: string,
  ): React.ReactElement => {
    if (key === "features") {
      return (
        <MarketingFeaturesMegaMenu className={className} onNavigate={onNavigate} />
      );
    }
    if (key === "integrations") {
      return (
        <MarketingIntegrationsMegaMenu
          className={className}
          onNavigate={onNavigate}
        />
      );
    }
    return (
      <MarketingMadeForMegaMenu className={className} onNavigate={onNavigate} />
    );
  };

  const navLinkBase =
    "whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-bold leading-none tracking-tight transition-all duration-300 xl:px-4 xl:text-base";
  const navLinkInactive = "text-white hover:bg-white/10";
  const navLinkActive =
    "bg-white/15 text-white shadow-inner shadow-white/5 ring-1 ring-white/20";

  return (
    <>
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 sm:px-4"
        initial={false}
        animate={{ paddingTop: scrolled ? 10 : 16 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <div className="relative mx-auto w-full max-w-[min(1728px,calc(100vw-2rem))]">
          {/*
            Plain nav (no FM entrance). FM 12 was re-applying `initial` on mega open
            and leaving the pill at opacity:0 / translateY(-100px).
          */}
          <nav
            aria-label={t("marketing.navMainAria")}
            className={cn(
              "pointer-events-auto mx-auto flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border backdrop-blur-xl",
              "transition-[max-width,padding,box-shadow,border-color,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3",
              scrolled
                ? "max-w-[min(1200px,calc(100vw-2rem))] border-slate-800 bg-slate-900/95 py-2 shadow-lg shadow-black/30 ring-1 ring-white/10 sm:px-4"
                : "max-w-[min(1728px,calc(100vw-2rem))] border-slate-800/80 bg-slate-900/90 shadow-2xl shadow-black/40",
            )}
          >
            <Link
              href="/"
              className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5"
            >
              <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: -2 }}
                className="h-8 w-8 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 shadow-lg shadow-black/30 sm:h-9 sm:w-9"
              >
                <PostsivaLogoMark size={36} priority className="h-full w-full" />
              </motion.div>
              <span
                className={cn(
                  "truncate font-bold tracking-tight text-white transition-[font-size] duration-500 ease-out",
                  scrolled ? "text-base sm:text-lg" : "text-lg sm:text-xl",
                )}
              >
                Postsiva
              </span>
            </Link>

            {showDesktopNav ? (
              <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
                {MARKETING_NAV.map((link) => {
                  const label = "label" in link ? link.label : t(link.labelKey);
                  const external = "external" in link && link.external;
                  const megaKey = megaKeyForHref(link.href);
                  const active =
                    !external &&
                    (pathname === link.href ||
                      (megaKey === "made-for" && isMadeForRoute));

                  if (megaKey) {
                    const megaOpen = desktopMega === megaKey;
                    return (
                      <div
                        key={link.href}
                        className="relative"
                        onMouseEnter={() => openMega(megaKey)}
                        onMouseLeave={scheduleCloseMega}
                      >
                        <button
                          type="button"
                          aria-expanded={megaOpen}
                          aria-controls={megaMenuId(megaKey)}
                          aria-haspopup="true"
                          onClick={() =>
                            setDesktopMega((current) =>
                              current === megaKey ? null : megaKey,
                            )
                          }
                          className={cn(
                            "inline-flex items-center gap-1.5",
                            navLinkBase,
                            megaOpen || active ? navLinkActive : navLinkInactive,
                          )}
                        >
                          {label}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              megaOpen && "rotate-180",
                            )}
                          />
                        </button>
                      </div>
                    );
                  }

                  return external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(navLinkBase, navLinkInactive)}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        navLinkBase,
                        active ? navLinkActive : navLinkInactive,
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            ) : null}

            <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
              <PublicLanguageSwitcher
                compact
                className="hidden border-white/15 bg-white/10 sm:inline-flex [&_button:not([aria-pressed=true])]:text-white/65 [&_button:not([aria-pressed=true])]:hover:text-white"
              />
              {!authenticated ? (
                <Link
                  href="/login"
                  className="hidden rounded-full px-2.5 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white md:inline lg:px-3"
                  suppressHydrationWarning
                >
                  {t("marketing.navLogin")}
                </Link>
              ) : null}
              <Link
                href={ctaHref}
                className="inline-flex max-w-[9.5rem] items-center gap-1.5 rounded-xl bg-[#0058bc] py-1.5 pl-3 pr-1.5 text-xs font-bold text-white shadow-lg shadow-[#0058bc]/25 transition-colors hover:bg-[#004a9e] sm:max-w-none sm:gap-2 sm:pl-4 sm:text-sm"
                suppressHydrationWarning
              >
                <span className="hidden truncate sm:inline" suppressHydrationWarning>
                  {ctaLabel}
                </span>
                <span className="truncate sm:hidden" suppressHydrationWarning>
                  {ctaLabelShort}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-on-primary/10 text-on-primary sm:h-8 sm:w-8">
                  <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </Link>
              <button
                type="button"
                aria-expanded={open}
                aria-label={open ? t("marketing.navCloseMenu") : t("marketing.navOpenMenu")}
                className={cn(
                  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white",
                  showDesktopNav ? "xl:hidden" : "inline-flex",
                )}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {/*
            Plain panel (no AnimatePresence / motion initial). FM 12 + React 19 was
            resetting every landing `initial={{ opacity: 0 }}` when this Presence mounted.
          */}
          {showDesktopNav && desktopMega ? (
            <div
              id={megaMenuId(desktopMega)}
              role="menu"
              aria-label={megaMenuLabel(desktopMega)}
              onMouseEnter={() => openMega(desktopMega)}
              onMouseLeave={scheduleCloseMega}
              className={cn(
                "pointer-events-auto absolute left-1/2 top-[calc(100%+0.5rem)] z-50 -translate-x-1/2 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
                !reduceMotion && "animate-[marketing-mega-in_0.2s_ease-out]",
                megaMenuWidth(),
              )}
            >
              <div aria-hidden className="absolute inset-x-8 -top-4 h-4" />
              {renderMegaContent(desktopMega, () => setDesktopMega(null))}
            </div>
          ) : null}
        </div>
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
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={
                reduceMotion ? { duration: 0.15 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
              }
              className={cn(
                "fixed left-3 right-3 z-50 max-h-[min(80vh,40rem)] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl",
                scrolled ? "top-[3.25rem]" : "top-[4.25rem]",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <PublicLanguageSwitcher compact />
                {!authenticated ? (
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-white/75 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    {t("marketing.navLogin")}
                  </Link>
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                {MARKETING_NAV.map((link) => {
                  const label = "label" in link ? link.label : t(link.labelKey);
                  const external = "external" in link && link.external;
                  const megaKey = megaKeyForHref(link.href);

                  if (external) {
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl px-3 py-3 text-base font-bold text-white hover:bg-white/10"
                        onClick={() => setOpen(false)}
                      >
                        {label}
                      </a>
                    );
                  }

                  if (megaKey) {
                    const expanded = mobileMega === megaKey;
                    return (
                      <div key={link.href}>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-base font-bold text-white hover:bg-white/10"
                          onClick={() =>
                            setMobileMega((current) =>
                              current === megaKey ? null : megaKey,
                            )
                          }
                        >
                          {label}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-white/60 transition-transform",
                              expanded && "rotate-180",
                            )}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {expanded ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {renderMegaContent(
                                megaKey,
                                () => setOpen(false),
                                "bg-slate-900",
                              )}
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-xl px-3 py-3 text-base font-bold text-white hover:bg-white/10"
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
