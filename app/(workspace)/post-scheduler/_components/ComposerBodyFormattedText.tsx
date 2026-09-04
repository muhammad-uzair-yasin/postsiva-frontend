"use client";

import type { ReactElement } from "react";

import {
  splitComposerInlineSegments,
  type ComposerInlineSegment,
} from "@/lib/post-composer/composerBodyInlineSegments";

export interface ComposerBodyFormattedTextProps {
  readonly text: string;
  readonly className?: string;
  readonly boldClassName?: string;
  readonly highlightClassName?: string;
}

function renderSegments(
  segments: readonly ComposerInlineSegment[],
  boldClassName: string,
  highlightClassName: string,
): ReactElement[] {
  return segments.map((segment, index) => {
    if (segment.kind === "bold") {
      return (
        <strong key={index} className={boldClassName}>
          {segment.value}
        </strong>
      );
    }
    if (segment.kind === "highlight") {
      return (
        <span key={index} className={highlightClassName}>
          {segment.value}
        </span>
      );
    }
    return <span key={index}>{segment.value}</span>;
  });
}

/** Renders composer caption with platform-style bold (no visible ** asterisks). */
export function ComposerBodyFormattedText({
  text,
  className = "",
  boldClassName = "font-bold text-inherit",
  highlightClassName = "font-medium text-secondary",
}: ComposerBodyFormattedTextProps): ReactElement {
  const lines = text.split("\n");

  return (
    <span className={className}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {lineIndex > 0 ? "\n" : null}
          {renderSegments(
            splitComposerInlineSegments(line),
            boldClassName,
            highlightClassName,
          )}
        </span>
      ))}
    </span>
  );
}
