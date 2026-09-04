"use client";

import type { TextPreset } from "../_data/presets";

export function PresetChips({
  presets,
  onSelect,
  disabled,
}: {
  presets: TextPreset[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(preset.text)}
          className="rounded-full border border-outline-variant/30 bg-surface-container-lowest px-3 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-primary/8 hover:text-on-surface disabled:opacity-50"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
