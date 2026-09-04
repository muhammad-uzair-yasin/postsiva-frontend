"use client";

import {
  type CatalogProvider,
  ensureOption,
  modelOptions,
  type ProviderModelRef,
  providerOptions,
} from "@/lib/admin/aiManagerApi";

const SELECT_CLASS =
  "w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm text-on-surface disabled:opacity-50";

interface SlotPickerProps {
  label: string;
  routeKey: string;
  catalog: CatalogProvider[];
  value: ProviderModelRef;
  onChange: (next: ProviderModelRef) => void;
  disabled?: boolean;
  /** Smaller labels for fallback rows (legacy parity). */
  compact?: boolean;
}

/** Provider + model select pair fed by the provider catalog. */
export function SlotPicker({
  label,
  routeKey,
  catalog,
  value,
  onChange,
  disabled,
  compact,
}: SlotPickerProps) {
  const providers = providerOptions(catalog, routeKey);
  const models = modelOptions(catalog, value.provider, routeKey);
  const labelClass = compact
    ? "mb-1 block text-xs text-on-surface-variant"
    : "mb-1 block text-sm font-medium text-on-surface";

  const handleProviderChange = (provider: string) => {
    const nextModels = modelOptions(catalog, provider, routeKey);
    onChange({ provider, model: ensureOption(nextModels, value.model) });
  };

  return (
    <>
      <div>
        <label className={labelClass}>{label} provider</label>
        <select
          className={SELECT_CLASS}
          value={value.provider}
          disabled={disabled}
          onChange={(e) => handleProviderChange(e.target.value)}
        >
          {providers.every((o) => o.value !== value.provider) && value.provider ? (
            <option value={value.provider}>{value.provider}</option>
          ) : null}
          {providers.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>{compact ? "Model" : `${label} model`}</label>
        <select
          className={SELECT_CLASS}
          value={value.model}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, model: e.target.value })}
        >
          {models.every((o) => o.value !== value.model) && value.model ? (
            <option value={value.model}>{value.model}</option>
          ) : null}
          {models.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
