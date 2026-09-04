"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Toggle dropdown; close on outside click or Escape. */
export function useDropdownOpen(): {
  open: boolean;
  setOpen: (value: boolean) => void;
  toggle: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
} {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggle = useCallback((): void => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent): void => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, toggle, containerRef };
}
