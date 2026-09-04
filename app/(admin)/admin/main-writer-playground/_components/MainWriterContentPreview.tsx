"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { postContentToMarkdown } from "@/lib/admin/mainWriterPlaygroundApi";

const postMarkdownComponents: Partial<Components> = {
  p: ({ children }) => <p className="mb-3 whitespace-pre-wrap leading-relaxed last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-extrabold text-on-surface">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => (
    <h2 className="mb-4 mt-0 text-xl font-extrabold leading-snug tracking-tight text-on-surface first:mt-0">
      {children}
    </h2>
  ),
  h2: ({ children }) => <h4 className="mb-2 mt-4 text-base font-bold first:mt-0">{children}</h4>,
  h3: ({ children }) => (
    <h5 className="mb-1.5 mt-3 text-sm font-bold text-on-surface first:mt-0">{children}</h5>
  ),
};

export function MainWriterContentPreview({ content }: { content: string }) {
  const markdown = postContentToMarkdown(content);

  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-sm text-on-surface">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={postMarkdownComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
