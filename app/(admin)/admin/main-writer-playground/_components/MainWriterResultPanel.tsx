"use client";

import { useState } from "react";
import { Clock, Cpu, ImageIcon, LayoutGrid, Loader2, Type } from "lucide-react";

import {
  formatModelUsedLabel,
  type MainWriterPlaygroundViewModel,
} from "@/lib/admin/mainWriterPlaygroundApi";

import { MainWriterContentPreview } from "./MainWriterContentPreview";
import { MainWriterPlatformPreviews } from "./MainWriterPlatformPreviews";

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Type;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function TitleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="mt-1 text-sm text-on-surface">{value}</p>
    </div>
  );
}

export function MainWriterResultPanel({
  view,
  pending,
  errorText,
  statusText,
  isError,
  targetPlatforms = [],
}: {
  view: MainWriterPlaygroundViewModel | null;
  pending: boolean;
  errorText: string | null;
  statusText: string | null;
  isError: boolean;
  targetPlatforms?: string[];
}) {
  const [showRaw, setShowRaw] = useState(false);
  const elapsedLabel = view?.elapsedLabel ?? null;

  const platformTitles = view
    ? [
        { label: "YouTube title", value: view.youtubeTitle },
        { label: "Pinterest title", value: view.pinterestTitle },
        { label: "TikTok title", value: view.tiktokTitle },
      ].filter((row) => row.value?.trim())
    : [];

  const rawJson =
    view && view.success
      ? JSON.stringify(
          {
            generation_time_ms: view.elapsedMs,
            generation_time: view.elapsedLabel,
            provider: view.provider,
            model: view.model,
            attempt: view.attempt,
            route_slot: view.routeSlot,
            model_label: formatModelUsedLabel(view),
            content: view.content,
            youtube_title: view.youtubeTitle,
            pinterest_title: view.pinterestTitle,
            tiktok_title: view.tiktokTitle,
            recommended_image_keywords: view.keywords,
          },
          null,
          2,
        )
      : null;

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-on-surface">Response</h2>
        <div className="flex flex-wrap items-center gap-2">
          {elapsedLabel && !pending ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/25 bg-surface-container-lowest px-3 py-1 text-xs font-bold text-on-surface">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Generation time: {elapsedLabel}
            </span>
          ) : null}
          {view?.modelLabel && !pending ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/25 bg-surface-container-lowest px-3 py-1 text-xs font-bold text-on-surface">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              Model: {view.modelLabel}
            </span>
          ) : null}
          {statusText ? (
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                isError ? "text-error" : "text-on-surface-variant"
              }`}
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : null}
              {statusText}
            </span>
          ) : null}
        </div>
      </div>

      {pending ? (
        <p className="mt-4 text-sm text-on-surface-variant">Waiting for the main writer…</p>
      ) : null}

      {!pending && errorText ? (
        <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-error/25 bg-error/5 p-4 text-sm text-error">
          {errorText}
        </pre>
      ) : null}

      {!pending && view?.success ? (
        <div className="mt-5 space-y-5">
          <Section title="Post content (preview)" icon={Type}>
            <MainWriterContentPreview content={view.content} />
          </Section>

          <Section title="Platform preview" icon={LayoutGrid}>
            <MainWriterPlatformPreviews view={view} targetPlatforms={targetPlatforms} />
          </Section>

          {platformTitles.length > 0 ? (
            <Section title="Platform titles" icon={Type}>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {platformTitles.map((row) => (
                  <TitleRow key={row.label} label={row.label} value={row.value!} />
                ))}
              </div>
            </Section>
          ) : null}

          {view.keywords.length > 0 ? (
            <Section title="Recommended image keywords" icon={ImageIcon}>
              <ul className="divide-y divide-outline-variant/15 rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
                {view.keywords.map((keyword, index) => (
                  <li key={`${keyword.query ?? "kw"}-${index}`} className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-on-surface">
                      {keyword.query?.trim() || "—"}
                    </p>
                    {keyword.reason?.trim() ? (
                      <p className="mt-0.5 text-xs text-on-surface-variant">{keyword.reason}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {rawJson ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowRaw((current) => !current)}
                className="text-xs font-bold text-primary hover:underline"
              >
                {showRaw ? "Hide raw JSON" : "Show raw JSON"}
              </button>
              {showRaw ? (
                <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-xs text-on-surface-variant">
                  {rawJson}
                </pre>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {!pending && !errorText && !view ? (
        <p className="mt-4 text-sm text-on-surface-variant">No response yet.</p>
      ) : null}
    </div>
  );
}
