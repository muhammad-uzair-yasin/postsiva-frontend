"use client";

import { useLayoutEffect, useMemo, useRef, useState, useEffect, type ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { ComposerBodyFormattedText } from "./ComposerBodyFormattedText";
import { splitPreviewBodySegments } from "../_utils/postSchedulerPreviewBodySegments";
import {
  composerBodyHasBoldMarkup,
  composerBodyNeedsFullMarkdown,
} from "@/lib/post-composer/composerBodyInlineSegments";

/** Default collapsed caption lines in platform mockups (Facebook-style). */
export const POST_SCHEDULER_PREVIEW_BODY_MAX_LINES = 10;

export interface PostSchedulerPreviewFormattedBodyProps {
  /** Raw composer text (matches textarea — spacing preserved, not trimmed for display). */
  readonly text: string | undefined;
  /** Pass through to wrapper: `font-body leading-relaxed whitespace-pre-wrap break-words` + colors. */
  readonly className: string;
  readonly highlightClassName?: string;
  /** Bold `**text**` emphasis — defaults to heavy weight, same color as body. */
  readonly boldClassName?: string;
  readonly placeholder?: string;
  readonly placeholderClassName?: string;
  /** Collapse after this many lines (measured); shows "See more" when overflow. */
  readonly maxPreviewLines?: number;
  /** Legacy char clamp when {@link maxPreviewLines} is 0 or disabled. */
  readonly maxPreviewChars?: number;
  /** LinkedIn-style inline control (default: "See more"). */
  readonly moreLinkText?: string;
  readonly moreLinkClassName?: string;
  readonly lessLinkClassName?: string;
  /** Scrollable region when expanded after line clamp. */
  readonly expandedScrollClassName?: string;
}

function lineClampClass(lines: number): string {
  if (lines === 10) {
    return "line-clamp-10";
  }
  if (lines === 6) {
    return "line-clamp-6";
  }
  if (lines === 4) {
    return "line-clamp-4";
  }
  if (lines === 3) {
    return "line-clamp-3";
  }
  if (lines === 2) {
    return "line-clamp-2";
  }
  return `[display:-webkit-box] [-webkit-line-clamp:${lines}] [-webkit-box-orient:vertical] overflow-hidden`;
}

/**
 * Renders caption like the composer textarea: `pre-wrap` line breaks + token highlighting.
 */
export function PostSchedulerPreviewFormattedBody({
  text,
  className,
  highlightClassName = "font-medium text-secondary",
  boldClassName = "font-bold text-inherit",
  placeholder,
  placeholderClassName,
  maxPreviewLines = POST_SCHEDULER_PREVIEW_BODY_MAX_LINES,
  maxPreviewChars = 100,
  moreLinkText,
  moreLinkClassName = "text-xs font-semibold text-secondary hover:underline",
  lessLinkClassName = "text-xs font-semibold text-secondary hover:underline",
  expandedScrollClassName = "max-h-[min(14rem,35vh)] overflow-y-auto overflow-x-hidden pr-1 workspace-dashboard-scroll",
}: PostSchedulerPreviewFormattedBodyProps): ReactElement {
  const { t } = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const measureRef = useRef<HTMLParagraphElement>(null);
  const [overflowsLineLimit, setOverflowsLineLimit] = useState(false);
  const resolvedPlaceholder =
    placeholder === undefined ? t("postScheduler.preview.bodyPlaceholder") : placeholder;
  const resolvedMoreLinkText = moreLinkText ?? t("postScheduler.preview.seeMore");
  const normalizedText = text ?? "";
  const isEmpty = normalizedText.trim().length === 0;

  useEffect(() => {
    setExpanded(false);
  }, [normalizedText]);
  const hasMarkdownSyntax = useMemo(
    () => composerBodyNeedsFullMarkdown(normalizedText),
    [normalizedText],
  );
  const useInlineBoldPreview =
    !isEmpty && composerBodyHasBoldMarkup(normalizedText) && !hasMarkdownSyntax;
  const useLineClamp = !isEmpty && !hasMarkdownSyntax && !useInlineBoldPreview && maxPreviewLines > 0;
  const shouldClampChars =
    !isEmpty &&
    !hasMarkdownSyntax &&
    !useInlineBoldPreview &&
    maxPreviewLines <= 0 &&
    normalizedText.length > maxPreviewChars;

  useLayoutEffect(() => {
    if (!useLineClamp) {
      setOverflowsLineLimit(false);
      return;
    }
    const el = measureRef.current;
    if (!el) {
      return;
    }
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
      setOverflowsLineLimit(normalizedText.split("\n").length > maxPreviewLines);
      return;
    }
    setOverflowsLineLimit(el.scrollHeight > maxPreviewLines * lineHeight + 1);
  }, [maxPreviewLines, normalizedText, useLineClamp, className]);

  const displayText = useMemo(() => {
    if (!shouldClampChars || expanded) {
      return normalizedText;
    }
    return normalizedText.slice(0, maxPreviewChars).trimEnd();
  }, [expanded, maxPreviewChars, normalizedText, shouldClampChars]);

  const fullSegments = useMemo(
    () => splitPreviewBodySegments(normalizedText),
    [normalizedText],
  );
  const charClampSegments = useMemo(
    () => splitPreviewBodySegments(displayText),
    [displayText],
  );

  const renderSegmentParagraph = (
    paragraphClassName: string,
    segs: ReturnType<typeof splitPreviewBodySegments>,
  ): ReactElement => (
    <p className={paragraphClassName}>
      {segs.map((seg, i) =>
        seg.highlight ? (
          <span key={i} className={highlightClassName}>
            {seg.value}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </p>
  );

  if (isEmpty) {
    const muted =
      placeholderClassName ?? "text-on-surface-variant/80";
    return <p className={`${className} ${muted}`}>{resolvedPlaceholder}</p>;
  }

  const markdownComponents: Partial<Components> = {
    p: ({ children }) => <p className={className}>{children}</p>,
    br: () => <br />,
    strong: ({ children }) => <strong className={boldClassName}>{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${highlightClassName} underline`}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className={`${className} list-disc pl-5`}>{children}</ul>,
    ol: ({ children }) => (
      <ol className={`${className} list-decimal pl-5`}>{children}</ol>
    ),
    li: ({ children }) => <li className="my-0.5">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className={`${className} border-l-2 border-outline/35 pl-3 italic opacity-90`}>
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="rounded bg-surface-container-low px-1 py-0.5 font-mono text-[0.92em]">
        {children}
      </code>
    ),
  };

  if (useInlineBoldPreview) {
    return (
      <div className={`whitespace-pre-wrap break-words ${expandedScrollClassName}`}>
        <ComposerBodyFormattedText
          text={normalizedText}
          className={className}
          boldClassName={boldClassName}
          highlightClassName={highlightClassName}
        />
      </div>
    );
  }

  if (hasMarkdownSyntax) {
    return (
      <div className={`space-y-2 ${expandedScrollClassName}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {normalizedText}
        </ReactMarkdown>
      </div>
    );
  }

  if (useLineClamp) {
    const showToggle = overflowsLineLimit;
    return (
      <div className="relative min-w-0 shrink-0">
        <p
          ref={measureRef}
          aria-hidden
          className={`${className} pointer-events-none invisible absolute inset-x-0 top-0 -z-10 opacity-0`}
        >
          {fullSegments.map((seg, i) =>
            seg.highlight ? (
              <span key={i} className={highlightClassName}>
                {seg.value}
              </span>
            ) : (
              <span key={i}>{seg.value}</span>
            ),
          )}
        </p>
        {showToggle && !expanded ? (
          <>
            {renderSegmentParagraph(
              `${className} ${lineClampClass(maxPreviewLines)}`,
              fullSegments,
            )}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={`mt-0.5 inline-block ${moreLinkClassName}`}
            >
              {resolvedMoreLinkText}
            </button>
          </>
        ) : showToggle && expanded ? (
          <>
            <div className={expandedScrollClassName}>
              {renderSegmentParagraph(className, fullSegments)}
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className={`mt-1 ${lessLinkClassName}`}
            >
              {t("postScheduler.preview.seeLess")}
            </button>
          </>
        ) : (
          renderSegmentParagraph(className, fullSegments)
        )}
      </div>
    );
  }

  return (
    <div>
      {renderSegmentParagraph(className, charClampSegments)}
      {shouldClampChars && !expanded ? (
        <>
          <span className={className}>... </span>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={`inline ${moreLinkClassName}`}
          >
            {resolvedMoreLinkText}
          </button>
        </>
      ) : null}
      {shouldClampChars && expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className={`mt-1 ${lessLinkClassName}`}
        >
          {t("postScheduler.preview.seeLess")}
        </button>
      ) : null}
    </div>
  );
}
