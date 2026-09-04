"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";

import type {
  AdminWorkspace,
  PivaProbeBody,
  ProviderCatalogItem,
} from "@/lib/admin/aiProvidersApi";
import {
  buildPivaProbeBody,
  clearHistoryConfirmMessage,
  modelOptionLabel,
  providerOptionLabel,
  textModels,
  workspaceOptionLabel,
} from "@/lib/admin/aiProvidersApi";
import type { ProbeKind } from "../_hooks/useAiProviderProbes";
import { FieldLabel, inputClass, ProbeButton, SelectField } from "./FormControls";

/** Piva agent probe: workspace + provider/model + message, plus clear-history. */
export function PivaProbePanel({
  workspaces,
  workspacesLoading,
  workspacesError,
  providers,
  workspaceId,
  onWorkspaceChange,
  providerId,
  onProviderChange,
  modelId,
  onModelChange,
  busy,
  onSend,
  onClearHistory,
}: {
  workspaces: AdminWorkspace[];
  workspacesLoading: boolean;
  workspacesError: string | null;
  providers: ProviderCatalogItem[];
  workspaceId: string;
  onWorkspaceChange: (id: string) => void;
  providerId: string;
  onProviderChange: (id: string) => void;
  modelId: string;
  onModelChange: (id: string) => void;
  busy: ProbeKind | null;
  onSend: (body: PivaProbeBody) => void;
  onClearHistory: (workspaceId: string) => void;
}) {
  const [message, setMessage] = useState("hi — admin provider check");

  const provider = providers.find((p) => p.id === providerId);
  const body = buildPivaProbeBody(workspaceId, providerId, modelId, message);
  const canSend = body !== null && provider?.configured === true;

  const workspacePlaceholder = workspacesLoading
    ? "Loading workspaces…"
    : workspacesError
      ? `Error: ${workspacesError}`
      : workspaces.length === 0
        ? "No workspaces for this admin account"
        : "Select workspace…";

  const handleClearHistory = () => {
    if (!workspaceId) return;
    const selected = workspaces.find((w) => w.id === workspaceId);
    const label = selected ? workspaceOptionLabel(selected) : workspaceId;
    if (!window.confirm(clearHistoryConfirmMessage(label))) return;
    onClearHistory(workspaceId);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
      <div>
        <h2 className="text-sm font-bold text-on-surface">Piva agent probe</h2>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          Select a workspace, provider, and model — then send a test message to Piva.
        </p>
      </div>
      <div>
        <FieldLabel htmlFor="workspaceSelect">Workspace</FieldLabel>
        <SelectField
          id="workspaceSelect"
          value={workspaceId}
          onChange={onWorkspaceChange}
          placeholder={workspacePlaceholder}
          disabled={workspacesLoading}
          options={workspaces.map((w) => ({
            value: w.id,
            label: workspaceOptionLabel(w),
          }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="providerSelect">Provider</FieldLabel>
          <SelectField
            id="providerSelect"
            value={providerId}
            onChange={onProviderChange}
            options={providers.map((p) => ({
              value: p.id,
              label: providerOptionLabel(p),
              disabled: !p.configured,
            }))}
          />
        </div>
        <div>
          <FieldLabel htmlFor="modelSelect">Model</FieldLabel>
          <SelectField
            id="modelSelect"
            value={modelId}
            onChange={onModelChange}
            options={textModels(provider).map((m) => ({
              value: m.id,
              label: modelOptionLabel(m),
            }))}
          />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="messageInput">Message</FieldLabel>
        <textarea
          id="messageInput"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say hi to Piva or ask for connected accounts…"
          className={inputClass}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ProbeButton
          onClick={() => body && onSend(body)}
          disabled={!canSend || busy !== null}
          busy={busy === "piva"}
          icon={Send}
        >
          Send to Piva
        </ProbeButton>
        <ProbeButton
          onClick={handleClearHistory}
          disabled={!workspaceId || busy !== null}
          busy={busy === "clear"}
          icon={Trash2}
          tone="danger"
        >
          Clear chat history
        </ProbeButton>
      </div>
      <p className="text-[11px] text-on-surface-variant">
        Clear removes LangGraph memory + archived turns for the selected workspace
        (WhatsApp / website / mobile share one thread).
      </p>
    </div>
  );
}
