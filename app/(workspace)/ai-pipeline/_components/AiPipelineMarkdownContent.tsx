"use client";

import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { AiPipelineMermaidDiagram } from "./AiPipelineMermaidDiagram";

function mermaidSourceFromPreChildren(children: ReactNode): string | null {
  const first = Children.toArray(children)[0];
  if (!isValidElement(first)) {
    return null;
  }
  const props = first.props as { className?: string; children?: ReactNode };
  const cls = props.className ?? "";
  if (!cls.includes("language-mermaid")) {
    return null;
  }
  const text = String(props.children ?? "").replace(/\n$/, "");
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const markdownComponents: Partial<Components> = {
  a: ({ href, children, ...props }) => (
    <a
      href={href ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element -- remote URLs from agent markdown
    <img
      src={typeof src === "string" ? src : ""}
      alt={typeof alt === "string" ? alt : ""}
      className="my-2 max-h-96 max-w-full rounded-lg border border-outline-variant/25"
      loading="lazy"
      {...props}
    />
  ),
  pre: ({ children }) => {
    const src = mermaidSourceFromPreChildren(children);
    if (src !== null) {
      return <AiPipelineMermaidDiagram source={src} />;
    }
    return <pre>{children}</pre>;
  },
};

interface AiPipelineMarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renders assistant text with GitHub-flavored Markdown (lists, tables, code, task lists, etc.).
 * Visual styles live in `globals.css` under `.ai-pipeline-md`.
 */
export function AiPipelineMarkdownContent({
  content,
  className = "",
}: AiPipelineMarkdownContentProps): ReactElement {
  return (
    <div className={`ai-pipeline-md min-w-0 max-w-full ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
