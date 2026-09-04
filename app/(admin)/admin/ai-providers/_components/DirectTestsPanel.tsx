"use client";

import { useState } from "react";
import { ImagePlus, ScanEye, Zap } from "lucide-react";

import type {
  DirectTextProbeBody,
  GalleryMediaItem,
  ImageGenerationProbeBody,
  MediaProbeBody,
  ProviderCatalogItem,
  ProviderModel,
} from "@/lib/admin/aiProvidersApi";
import {
  buildDirectTextProbeBody,
  buildImageGenerationProbeBody,
  buildMediaProbeBody,
  galleryMediaLabel,
  modelOptionLabel,
  providerOptionLabel,
  textModels,
} from "@/lib/admin/aiProvidersApi";
import type { ProbeKind, ProbeResultState } from "../_hooks/useAiProviderProbes";
import { FieldLabel, inputClass, ProbeButton, SelectField } from "./FormControls";
import { ProbeResultPanel } from "./ProbeResultPanel";

/** Controlled select defaulting to the first model until an explicit valid choice. */
function useDefaultModel(models: ProviderModel[]): [string, (id: string) => void] {
  const [choice, setChoice] = useState<string | null>(null);
  const modelId =
    choice !== null && models.some((m) => m.id === choice)
      ? choice
      : models[0]?.id ?? "";
  return [modelId, setChoice];
}

/** Direct provider tests: text call, gallery image analysis, image generation. */
export function DirectTestsPanel({
  providers,
  catalogLoading,
  visionModels,
  imageModels,
  workspaceId,
  gallery,
  galleryLoading,
  galleryError,
  busy,
  result,
  generatedImageUrl,
  onDirectText,
  onMediaProbe,
  onGenerateImage,
}: {
  providers: ProviderCatalogItem[];
  catalogLoading: boolean;
  visionModels: ProviderModel[];
  imageModels: ProviderModel[];
  workspaceId: string;
  gallery: GalleryMediaItem[];
  galleryLoading: boolean;
  galleryError: string | null;
  busy: ProbeKind | null;
  result: ProbeResultState | null;
  generatedImageUrl: string | null;
  onDirectText: (body: DirectTextProbeBody) => void;
  onMediaProbe: (body: MediaProbeBody) => void;
  onGenerateImage: (body: ImageGenerationProbeBody) => void;
}) {
  const textProviders = providers.filter(
    (provider) => provider.configured && textModels(provider).length > 0,
  );
  const [textProviderChoice, setTextProviderChoice] = useState<string | null>(null);
  const textProviderId =
    textProviderChoice && textProviders.some((provider) => provider.id === textProviderChoice)
      ? textProviderChoice
      : textProviders[0]?.id ?? "";
  const textProvider = textProviders.find((provider) => provider.id === textProviderId);
  const [textModelId, setTextModelId] = useDefaultModel(textModels(textProvider));
  const [directPrompt, setDirectPrompt] = useState(
    "Reply with exactly: Pollinations text API is active.",
  );
  const [mediaId, setMediaId] = useState("");
  const [visionModelId, setVisionModelId] = useDefaultModel(visionModels);
  const [visionPrompt, setVisionPrompt] = useState(
    "Describe this image accurately and identify any visible text.",
  );
  const [imageModelId, setImageModelId] = useDefaultModel(imageModels);
  const [imagePrompt, setImagePrompt] = useState(
    "A clean blue flower icon on a white background",
  );

  const directBody = buildDirectTextProbeBody(
    textProviderId,
    textModelId,
    directPrompt,
  );
  const mediaBody = buildMediaProbeBody(workspaceId, mediaId, visionModelId, visionPrompt);
  const imageBody = buildImageGenerationProbeBody(imageModelId, imagePrompt);

  const galleryPlaceholder = !workspaceId
    ? "Select a workspace first…"
    : galleryLoading
      ? "Loading gallery…"
      : galleryError
        ? galleryError
        : gallery.length === 0
          ? "No images found"
          : "Select gallery image…";

  return (
    <div className="space-y-5 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
      <div>
        <h2 className="text-sm font-bold text-on-surface">Direct provider tests</h2>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          Backend-authenticated provider calls; API keys never reach this browser.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Direct text call
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="directTextProviderSelect">Text provider</FieldLabel>
            <SelectField
              id="directTextProviderSelect"
              value={textProviderId}
              onChange={(id) => {
                setTextProviderChoice(id);
                setTextModelId("");
              }}
              placeholder={catalogLoading ? "Loading text providers…" : "Select text provider…"}
              disabled={catalogLoading}
              options={textProviders.map((provider) => ({
                value: provider.id,
                label: providerOptionLabel(provider),
              }))}
            />
          </div>
          <div>
            <FieldLabel htmlFor="directTextModelSelect">Text model</FieldLabel>
            <SelectField
              id="directTextModelSelect"
              value={textModelId}
              onChange={setTextModelId}
              placeholder={catalogLoading ? "Loading text models…" : "Select text model…"}
              disabled={catalogLoading || !textProviderId}
              options={textModels(textProvider).map((model) => ({
                value: model.id,
                label: modelOptionLabel(model, "text"),
              }))}
            />
          </div>
        </div>
        <textarea
          rows={3}
          value={directPrompt}
          onChange={(e) => setDirectPrompt(e.target.value)}
          className={inputClass}
        />
        <ProbeButton
          onClick={() => directBody && onDirectText(directBody)}
          disabled={directBody === null || busy !== null}
          busy={busy === "direct"}
          icon={Zap}
        >
          Test selected text model
        </ProbeButton>
        {result?.kind === "direct" ? (
          <ProbeResultPanel
            result={result}
            pending={busy === "direct"}
            generatedImageUrl={null}
          />
        ) : null}
      </div>

      <div className="space-y-2 border-t border-outline-variant/15 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Image analysis from Postsiva gallery
        </h3>
        <FieldLabel htmlFor="galleryMediaSelect">Gallery image</FieldLabel>
        <SelectField
          id="galleryMediaSelect"
          value={mediaId}
          onChange={setMediaId}
          placeholder={galleryPlaceholder}
          disabled={!workspaceId || galleryLoading}
          options={gallery.map((item) => ({
            value: item.media_id,
            label: galleryMediaLabel(item),
          }))}
        />
        <FieldLabel htmlFor="visionModelSelect">Vision model</FieldLabel>
        <SelectField
          id="visionModelSelect"
          value={visionModelId}
          onChange={setVisionModelId}
          options={visionModels.map((m) => ({
            value: m.id,
            label: modelOptionLabel(m, "text+image input"),
          }))}
        />
        <textarea
          rows={2}
          value={visionPrompt}
          onChange={(e) => setVisionPrompt(e.target.value)}
          className={inputClass}
        />
        <ProbeButton
          onClick={() => mediaBody && onMediaProbe(mediaBody)}
          disabled={mediaBody === null || busy !== null}
          busy={busy === "media"}
          icon={ScanEye}
        >
          Analyze selected image
        </ProbeButton>
        {result?.kind === "media" ? (
          <ProbeResultPanel
            result={result}
            pending={busy === "media"}
            generatedImageUrl={null}
          />
        ) : null}
      </div>

      <div className="space-y-2 border-t border-outline-variant/15 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Pollinations image generation
        </h3>
        <FieldLabel htmlFor="imageModelSelect">Image model</FieldLabel>
        <SelectField
          id="imageModelSelect"
          value={imageModelId}
          onChange={setImageModelId}
          options={imageModels.map((m) => ({
            value: m.id,
            label: modelOptionLabel(m, "image"),
          }))}
        />
        <input
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          maxLength={800}
          className={inputClass}
        />
        <ProbeButton
          onClick={() => imageBody && onGenerateImage(imageBody)}
          disabled={imageBody === null || busy !== null}
          busy={busy === "image"}
          icon={ImagePlus}
        >
          Generate test image
        </ProbeButton>
        {result?.kind === "image" ? (
          <ProbeResultPanel
            result={result}
            pending={busy === "image"}
            generatedImageUrl={generatedImageUrl}
          />
        ) : null}
      </div>
    </div>
  );
}
