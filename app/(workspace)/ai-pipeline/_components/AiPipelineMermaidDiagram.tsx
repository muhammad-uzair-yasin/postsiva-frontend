"use client";

import mermaid from "mermaid";
import { useEffect, useId, useState } from "react";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

let mermaidConfigured = false;

function ensureMermaidInit(): void {
  if (mermaidConfigured) {
    return;
  }
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "strict",
  });
  mermaidConfigured = true;
}

export interface AiPipelineMermaidDiagramProps {
  readonly source: string;
}

/**
 * Renders a single Mermaid diagram definition (content inside ```mermaid fences).
 */
export function AiPipelineMermaidDiagram({
  source,
}: AiPipelineMermaidDiagramProps): ReactElement {
  const { t } = useTranslations();
  const baseId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    ensureMermaidInit();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async (): Promise<void> => {
      const trimmed = source.trim();
      if (!trimmed) {
        setSvg("");
        setErr(null);
        return;
      }
      try {
        const id = `mmd-${baseId}-${Math.random().toString(36).slice(2, 11)}`;
        const { svg: out } = await mermaid.render(id, trimmed);
        if (!cancelled) {
          setSvg(out);
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : t("aiPipeline.diagramRenderError"));
          setSvg("");
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [source, baseId, t]);

  if (err !== null) {
    return (
      <div className="my-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
        {err}
      </div>
    );
  }
  if (svg.length === 0) {
    return (
      <div className="my-2 text-sm text-on-surface-variant">{t("aiPipeline.diagramRendering")}</div>
    );
  }
  return (
    <div
      className="my-3 min-w-0 overflow-x-auto [&_svg]:max-w-full"
      // eslint-disable-next-line react/no-danger -- Mermaid output is SVG from trusted render()
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
