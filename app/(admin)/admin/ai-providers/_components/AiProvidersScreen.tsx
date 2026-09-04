"use client";

import { useCallback, useState } from "react";
import { Bot } from "lucide-react";

import {
  firstConfiguredProviderId,
  imageModels,
  textModels,
  visionModels,
} from "@/lib/admin/aiProvidersApi";

import { useAiProviderProbes } from "../_hooks/useAiProviderProbes";
import {
  useAdminWorkspaces,
  useGalleryMedia,
  useProviderCatalog,
} from "../_hooks/useAiProvidersData";
import { DirectTestsPanel } from "./DirectTestsPanel";
import { PivaProbePanel } from "./PivaProbePanel";
import { ProbeResultPanel } from "./ProbeResultPanel";

export function AiProvidersScreen() {
  const catalog = useProviderCatalog();
  const workspacesState = useAdminWorkspaces();
  const probes = useAiProviderProbes();

  const [workspaceId, setWorkspaceId] = useState("");
  const [providerChoice, setProviderChoice] = useState<string | null>(null);
  const [modelChoice, setModelChoice] = useState<string | null>(null);

  const gallery = useGalleryMedia(workspaceId);

  // Derived selection: default to the first configured provider (legacy parity),
  // and to the provider's first text model when no valid explicit choice exists.
  const providerId =
    providerChoice ?? firstConfiguredProviderId(catalog.items) ?? "";
  const provider = catalog.items.find((p) => p.id === providerId);
  const providerTextModels = textModels(provider);
  const modelId =
    modelChoice !== null && providerTextModels.some((m) => m.id === modelChoice)
      ? modelChoice
      : providerTextModels[0]?.id ?? "";

  const handleProviderChange = useCallback((id: string) => {
    setProviderChoice(id);
    setModelChoice(null);
  }, []);

  const pollinations = catalog.items.find((p) => p.id === "pollinations");

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-on-surface">
          <Bot className="h-5 w-5 text-primary" />
          AI Providers
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Select text and image models directly, then run Piva, text, vision, or
          image-generation probes.
        </p>
      </div>

      {catalog.error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-error/25 bg-error/5 px-4 py-3 text-sm text-error">
          <span>{catalog.error}</span>
          <button type="button" onClick={catalog.reload} className="font-semibold underline">
            Retry model loading
          </button>
        </div>
      ) : null}

      <PivaProbePanel
        workspaces={workspacesState.items}
        workspacesLoading={workspacesState.loading}
        workspacesError={workspacesState.error}
        providers={catalog.items}
        workspaceId={workspaceId}
        onWorkspaceChange={setWorkspaceId}
        providerId={providerId}
        onProviderChange={handleProviderChange}
        modelId={modelId}
        onModelChange={setModelChoice}
        busy={probes.busy}
        onSend={probes.runPivaProbe}
        onClearHistory={probes.clearChatHistory}
      />

      {probes.result?.kind === "piva" || probes.result?.kind === "clear" ? (
        <ProbeResultPanel
          result={probes.result}
          pending={probes.busy === "piva" || probes.busy === "clear"}
          generatedImageUrl={null}
        />
      ) : null}

      <DirectTestsPanel
        providers={catalog.items}
        catalogLoading={catalog.loading}
        visionModels={visionModels(pollinations)}
        imageModels={imageModels(pollinations)}
        workspaceId={workspaceId}
        gallery={gallery.items}
        galleryLoading={gallery.loading}
        galleryError={gallery.error}
        busy={probes.busy}
        result={probes.result}
        generatedImageUrl={probes.generatedImageUrl}
        onDirectText={probes.runDirectTextProbe}
        onMediaProbe={probes.runMediaProbe}
        onGenerateImage={probes.runImageGeneration}
      />
    </div>
  );
}
