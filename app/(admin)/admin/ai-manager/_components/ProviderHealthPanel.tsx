"use client";

import { Activity, Loader2 } from "lucide-react";

import {
  HEALTH_PROVIDERS,
  healthBadge,
  type HealthTone,
} from "@/lib/admin/aiManagerApi";

import { useProviderHealth } from "../_hooks/useProviderHealth";

const TONE_CLASS: Record<HealthTone, string> = {
  up: "text-primary",
  down: "text-error",
  muted: "text-on-surface-variant",
};

/** Provider health probes: one box per provider with an up/down + latency badge. */
export function ProviderHealthPanel() {
  const { states, runCheck } = useProviderHealth();

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-on-surface">Provider health</h2>
      </div>
      <p className="mt-0.5 text-xs text-on-surface-variant">
        Live probes against each provider. Checks run on demand only.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HEALTH_PROVIDERS.map((provider) => {
          const state = states[provider.id];
          const badge = state?.result ? healthBadge(state.result) : null;
          return (
            <div
              key={provider.id}
              className="min-w-0 flex flex-col gap-2 rounded-xl border border-outline-variant/20 bg-surface-container p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-medium text-on-surface">
                  {provider.label}
                </span>
                <span className="text-xs font-semibold">
                  {provider.alwaysUp ? (
                    <span className={TONE_CLASS.up}>up</span>
                  ) : state?.checking ? (
                    <span className="text-on-surface-variant">checking…</span>
                  ) : state?.error ? (
                    <span className={TONE_CLASS.down}>error</span>
                  ) : badge ? (
                    <span className={TONE_CLASS[badge.tone]}>{badge.label}</span>
                  ) : (
                    <span className="text-on-surface-variant/60">—</span>
                  )}
                </span>
              </div>
              <p className="min-h-4 text-xs text-on-surface-variant">
                {provider.alwaysUp
                  ? "Not probed"
                  : state?.error || state?.result?.detail || ""}
              </p>
              <button
                type="button"
                disabled={!!provider.alwaysUp || !!state?.checking}
                onClick={() => void runCheck(provider.id)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container-low px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-50"
              >
                {state?.checking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {provider.alwaysUp ? "Always up" : "Check"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
