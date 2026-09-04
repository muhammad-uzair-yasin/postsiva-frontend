"use client";

import { useState } from "react";
import { Bot, Loader2, RefreshCw, Undo2, XCircle } from "lucide-react";

import { routeMetaFor } from "@/lib/admin/aiManagerApi";

import { useAiManager } from "../_hooks/useAiManager";
import { ConfirmDialog } from "./ConfirmDialog";
import { ProviderHealthPanel } from "./ProviderHealthPanel";
import { RouteCard } from "./RouteCard";

type PendingConfirm = { kind: "route"; key: string } | { kind: "all" } | null;

const IDLE_STATUS = { kind: "idle" as const, message: "" };

export function AiManagerScreen() {
  const {
    loading,
    loadError,
    catalog,
    routes,
    drafts,
    statuses,
    busyKeys,
    resetAllStatus,
    reload,
    updateDraft,
    saveRoute,
    resetRoute,
    resetAllRoutes,
  } = useAiManager();
  const [confirm, setConfirm] = useState<PendingConfirm>(null);

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === "all") {
      void resetAllRoutes();
    } else {
      void resetRoute(confirm.key);
    }
    setConfirm(null);
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-on-surface">
            <Bot className="h-5 w-5 text-primary" />
            AI Manager
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Runtime model routes: primary + ordered fallbacks per feature.
            Changes apply immediately without a deploy.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => setConfirm({ kind: "all" })}
            disabled={loading || resetAllStatus.kind === "pending"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/8 px-4 py-2 text-sm font-bold text-error hover:bg-error/15 disabled:opacity-50"
          >
            {resetAllStatus.kind === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Undo2 className="h-4 w-4" />
            )}
            Back to defaults (all routes)
          </button>
          {resetAllStatus.message ? (
            <span
              className={`text-xs ${
                resetAllStatus.kind === "error"
                  ? "text-error"
                  : resetAllStatus.kind === "ok"
                    ? "text-primary"
                    : "text-on-surface-variant"
              }`}
            >
              {resetAllStatus.message}
            </span>
          ) : null}
        </div>
      </div>

      <ProviderHealthPanel />

      {loading ? (
        <div
          className="flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-6"
          aria-busy
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-on-surface-variant">
            Loading routes and provider catalog…
          </span>
        </div>
      ) : loadError ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-error/25 bg-error/5 px-4 py-4">
          <XCircle className="h-4 w-4 shrink-0 text-error" />
          <span className="text-sm text-on-surface">{loadError}</span>
          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-1.5 text-sm font-bold text-on-surface hover:bg-surface-container-high"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : routes.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-6 text-sm text-on-surface-variant">
          No AI Manager routes returned by the server.
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
          {routes.map((route) => {
            const draft = drafts[route.config_key];
            if (!draft) return null;
            return (
              <RouteCard
                key={route.config_key}
                route={route}
                draft={draft}
                catalog={catalog}
                busy={!!busyKeys[route.config_key]}
                status={statuses[route.config_key] ?? IDLE_STATUS}
                onChangeDraft={(updater) => updateDraft(route.config_key, updater)}
                onSave={() => void saveRoute(route.config_key)}
                onResetRequest={() =>
                  setConfirm({ kind: "route", key: route.config_key })
                }
              />
            );
          })}
        </div>
      )}

      {confirm ? (
        <ConfirmDialog
          title={
            confirm.kind === "all"
              ? "Back to defaults for ALL routes?"
              : `Back to defaults for ${routeMetaFor(confirm.key).title}?`
          }
          body={
            confirm.kind === "all"
              ? "This clears every saved provider/model config and restores code defaults."
              : "This removes the saved config so code defaults apply."
          }
          confirmLabel="Back to defaults"
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      ) : null}
    </div>
  );
}
