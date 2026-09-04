"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminSend } from "@/lib/admin/adminFetch";
import type {
  ClearChatHistoryResponse,
  DirectProbeResponse,
  DirectTextProbeBody,
  ImageGenerationProbeBody,
  MediaProbeBody,
  PivaProbeBody,
  PivaProbeResponse,
  ProbeOutcome,
} from "@/lib/admin/aiProvidersApi";
import {
  errorText,
  imageGenerationOutcome,
  normalizeClearHistoryResult,
  normalizeDirectTextResult,
  normalizeMediaProbeResult,
  normalizePivaProbeResult,
} from "@/lib/admin/aiProvidersApi";
import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { getStoredAccessToken } from "@/lib/auth/session";

export type ProbeKind = "piva" | "direct" | "media" | "image" | "clear";

export interface ProbeResultState {
  kind: ProbeKind;
  statusText: string;
  isError: boolean;
  /** Verbatim body for the result panel; null while a probe is in flight. */
  resultText: string | null;
}

/** POST that returns raw image bytes (image-generation-probe). */
async function postForBlob(path: string, body: unknown): Promise<Blob> {
  const token = getStoredAccessToken();
  if (!token) throw new Error("Admin session missing");
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}${path}`,
    token,
    (t) => ({ Authorization: `Bearer ${t}`, "Content-Type": "application/json" }),
    { method: "POST", body: JSON.stringify(body) },
  );
  return res.blob();
}

export function useAiProviderProbes() {
  const [busy, setBusy] = useState<ProbeKind | null>(null);
  const [result, setResult] = useState<ProbeResultState | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const run = useCallback(
    async (
      kind: ProbeKind,
      pendingStatus: string,
      probe: () => Promise<ProbeOutcome>,
    ) => {
      setBusy(kind);
      setResult({ kind, statusText: pendingStatus, isError: false, resultText: null });
      try {
        const outcome = await probe();
        setResult({
          kind,
          statusText: outcome.statusText,
          isError: !outcome.ok,
          resultText: outcome.resultText,
        });
      } catch (err: unknown) {
        const message = errorText(err);
        setResult({ kind, statusText: message, isError: true, resultText: message });
      } finally {
        setBusy(null);
      }
    },
    [],
  );

  const runPivaProbe = useCallback(
    (body: PivaProbeBody) =>
      run("piva", "Sending…", async () =>
        normalizePivaProbeResult(
          await adminSend<PivaProbeResponse>(
            "POST",
            "/admin/api/ai/providers/probe",
            body,
          ),
        ),
      ),
    [run],
  );

  const runDirectTextProbe = useCallback(
    (body: DirectTextProbeBody) =>
      run("direct", "Calling provider directly…", async () =>
        normalizeDirectTextResult(
          await adminSend<DirectProbeResponse>(
            "POST",
            "/admin/api/ai/providers/direct-text-probe",
            body,
          ),
        ),
      ),
    [run],
  );

  const runMediaProbe = useCallback(
    (body: MediaProbeBody) =>
      run("media", "Analyzing image…", async () =>
        normalizeMediaProbeResult(
          await adminSend<DirectProbeResponse>(
            "POST",
            "/admin/api/ai/providers/media-probe",
            body,
          ),
        ),
      ),
    [run],
  );

  const runImageGeneration = useCallback(
    (body: ImageGenerationProbeBody) =>
      run("image", "Generating image…", async () => {
        const blob = await postForBlob(
          "/admin/api/ai/providers/image-generation-probe",
          body,
        );
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setGeneratedImageUrl(url);
        return imageGenerationOutcome(body.model);
      }),
    [run],
  );

  const clearChatHistory = useCallback(
    (workspaceId: string) =>
      run("clear", "Clearing chat history…", async () =>
        normalizeClearHistoryResult(
          await adminSend<ClearChatHistoryResponse>(
            "POST",
            "/admin/api/ai/providers/clear-chat-history",
            { workspace_id: workspaceId },
          ),
        ),
      ),
    [run],
  );

  return {
    busy,
    result,
    generatedImageUrl,
    runPivaProbe,
    runDirectTextProbe,
    runMediaProbe,
    runImageGeneration,
    clearChatHistory,
  };
}
