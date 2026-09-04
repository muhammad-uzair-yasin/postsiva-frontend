"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import type { MainWriterPlatformOption } from "../_data/platforms";

export function PlatformMultiSelect({
  id,
  options,
  value,
  onChange,
  disabled,
}: {
  id: string;
  options: MainWriterPlatformOption[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const selected = new Set(value);
  const summary =
    value.length === 0
      ? "All platforms (no filter)"
      : options
          .filter((option) => selected.has(option.id))
          .map((option) => option.label)
          .join(", ");

  const toggle = (platformId: string) => {
    const next = new Set(selected);
    if (next.has(platformId)) {
      next.delete(platformId);
    } else {
      next.add(platformId);
    }
    onChange(Array.from(next));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-left text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
      >
        <span className="truncate">{summary}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-on-surface-variant transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-outline-variant/25 bg-surface-container-low p-2 shadow-lg"
        >
          {options.map((option) => {
            const checked = selected.has(option.id);
            return (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-on-surface hover:bg-surface-container-high"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.id)}
                  className="h-4 w-4 rounded border-outline-variant/40 text-primary focus:ring-primary/40"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
