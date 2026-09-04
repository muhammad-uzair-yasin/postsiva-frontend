"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  POSTSIVA_SESSION_EXPIRED,
  getPendingSessionExpiry,
  type SessionExpiredDetail,
} from "@/lib/auth/session";

export function SessionExpiredModal(): React.ReactElement | null {
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const root = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    const onExpired = (event: Event): void => {
      const detail = (event as CustomEvent<SessionExpiredDetail>).detail;
      if (detail?.loginUrl) {
        setLoginUrl(detail.loginUrl);
      }
    };
    window.addEventListener(POSTSIVA_SESSION_EXPIRED, onExpired);
    const pending = getPendingSessionExpiry();
    const id = window.setTimeout(() => {
      if (pending?.loginUrl) setLoginUrl(pending.loginUrl);
    }, 0);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(POSTSIVA_SESSION_EXPIRED, onExpired);
    };
  }, []);

  useEffect(() => {
    if (!loginUrl) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    buttonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const overlay = overlayRef.current;
    const inertSiblings = [...document.body.children].filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== overlay,
    );
    const previousInert = inertSiblings.map((element) => element.inert);
    inertSiblings.forEach((element) => {
      element.inert = true;
    });
    const keepFocus = (event: KeyboardEvent): void => {
      if (event.key === "Tab") {
        event.preventDefault();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", keepFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keepFocus);
      inertSiblings.forEach((element, index) => {
        element.inert = previousInert[index] ?? false;
      });
      previousFocus?.focus();
    };
  }, [loginUrl]);

  if (!loginUrl || !root) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="glass-panel w-full max-w-md rounded-2xl border border-outline-variant/20 p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <span className="material-symbols-outlined text-3xl" aria-hidden>
            lock_clock
          </span>
        </div>
        <h2 id={titleId} className="mt-5 text-xl font-bold text-on-surface">
          Session expired
        </h2>
        <p
          id={descriptionId}
          className="mt-3 text-sm leading-relaxed text-on-surface-variant"
        >
          Kindly log in again. Your session has expired for your security.
        </p>
        <button
          ref={buttonRef}
          type="button"
          className="mt-6 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
          onClick={() => window.location.assign(loginUrl)}
        >
          Log in again
        </button>
      </div>
    </div>,
    root,
  );
}
