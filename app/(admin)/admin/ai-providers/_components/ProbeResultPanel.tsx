"use client";

import { Loader2 } from "lucide-react";

import type { ProbeResultState } from "../_hooks/useAiProviderProbes";

/** Shared result panel: status line + verbatim probe response (legacy responseBox). */
export function ProbeResultPanel({
  result,
  pending,
  generatedImageUrl,
}: {
  result: ProbeResultState | null;
  pending: boolean;
  generatedImageUrl: string | null;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-on-surface">Response</h2>
        {result ? (
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              result.isError ? "text-error" : "text-on-surface-variant"
            }`}
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : null}
            {result.statusText}
          </span>
        ) : null}
      </div>
      <pre className="mt-3 min-h-32 whitespace-pre-wrap break-words rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-sm text-on-surface">
        {result === null
          ? "No response yet."
          : result.resultText ?? "Waiting for the provider…"}
      </pre>
      {generatedImageUrl ? (
        /* Blob object URL from the image-generation probe; next/image cannot optimize it. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={generatedImageUrl}
          alt="Generated test result"
          className="mt-4 max-w-md rounded-xl border border-outline-variant/20"
        />
      ) : null}
    </div>
  );
}
