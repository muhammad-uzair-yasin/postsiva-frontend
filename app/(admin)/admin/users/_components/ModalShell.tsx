"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Centered modal card over a scrim; closes on Escape and backdrop click. */
export function ModalShell({ title, onClose, children }: ModalShellProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-on-surface">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
