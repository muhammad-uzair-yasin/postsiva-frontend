"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { OtpDigitBoxes } from "@/app/(auth)/verify-otp/_components/OtpDigitBoxes";
import { resendOtp, verifyOtp } from "@/lib/auth/authApi";
import {
  getStoredAccessToken,
  setStoredUser,
} from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useStoredAuthUser } from "../_hooks/useStoredAuthUser";
import { WorkspaceNoticeBanner } from "./WorkspaceNoticeBanner";

export function WorkspaceEmailVerificationBanner(): React.ReactElement | null {
  const { t } = useTranslations();
  const pathname = usePathname();
  const { user, isReady } = useStoredAuthUser();
  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const busyRef = useRef(false);
  busyRef.current = isVerifying || isResending;
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !busyRef.current) setOpen(false);
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  if (
    pathname.startsWith("/workspaces") ||
    !isReady ||
    !user ||
    user.email_verified
  ) {
    return null;
  }

  const close = (): void => {
    if (isVerifying || isResending) return;
    setOpen(false);
    setOtp("");
    setError(null);
    setInfo(null);
  };

  const requireToken = (): string | null => {
    const token = getStoredAccessToken()?.trim();
    if (!token) setError(t("dashboard.emailVerifySessionRequired"));
    return token || null;
  };

  const onVerify = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (otp.length !== 6) {
      setError(t("dashboard.emailVerifyCodeRequired"));
      return;
    }
    const token = requireToken();
    if (!token) return;
    setIsVerifying(true);
    try {
      const result = await verifyOtp(token, otp);
      setStoredUser(result.user);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("dashboard.emailVerifyFailed"));
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async (): Promise<void> => {
    setError(null);
    setInfo(null);
    const token = requireToken();
    if (!token) return;
    setIsResending(true);
    try {
      const result = await resendOtp(token);
      setInfo(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("dashboard.emailVerifyResendFailed"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className="relative z-40 px-3 pb-3 sm:px-6" role="status">
        <WorkspaceNoticeBanner
          actionRef={triggerRef}
          tone="warning"
          icon="mark_email_unread"
          body={t("dashboard.emailVerifyBannerBody")}
          cta={t("dashboard.emailVerifyBannerCta")}
          onAction={() => setOpen(true)}
        />
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="glass-panel w-full max-w-md rounded-2xl border border-outline-variant/20 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id={titleId} className="text-xl font-bold text-on-surface">
                      {t("dashboard.emailVerifyModalTitle")}
                    </h2>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {t("dashboard.emailVerifyModalBody", { email: user.email })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label={t("dashboard.emailVerifyClose")}
                    className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form className="mt-6 space-y-5" onSubmit={onVerify}>
                  <OtpDigitBoxes
                    value={otp}
                    onChange={setOtp}
                    disabled={isVerifying || isResending}
                  />
                  {error ? <p className="text-sm text-red-300" role="alert">{error}</p> : null}
                  {info ? <p className="text-sm text-emerald-300" role="status">{info}</p> : null}
                  <button
                    type="submit"
                    disabled={isVerifying || isResending || otp.length !== 6}
                    className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
                  >
                    {isVerifying
                      ? t("dashboard.emailVerifyVerifying")
                      : t("dashboard.emailVerifySubmit")}
                  </button>
                </form>
                <button
                  type="button"
                  disabled={isVerifying || isResending}
                  onClick={() => void onResend()}
                  className="mt-4 w-full text-sm font-bold text-secondary hover:underline disabled:opacity-60"
                >
                  {isResending
                    ? t("dashboard.emailVerifySending")
                    : t("dashboard.emailVerifyResend")}
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
