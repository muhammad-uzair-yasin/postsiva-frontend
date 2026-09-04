"use client";

import { useEffect, useState, type ReactElement } from "react";

import { pickRandomThinkingWord } from "./agentThinkingWords";

const WORD_ROTATE_MS = 2200;
const DOT_CYCLE_MS = 450;

function AnimatedEllipsis(): ReactElement {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, DOT_CYCLE_MS);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  return (
    <span aria-hidden className="inline-block min-w-[1.25em] text-left">
      {".".repeat(dotCount)}
    </span>
  );
}

export type AgentThinkingIndicatorProps = {
  className?: string;
  /** Capitalize the first letter of each word (default: true). */
  capitalize?: boolean;
};

/**
 * Lightweight “agent is responding” label: random -ing word + animated dots.
 */
export function AgentThinkingIndicator({
  className = "",
  capitalize = true,
}: AgentThinkingIndicatorProps): ReactElement {
  const [word, setWord] = useState(() => pickRandomThinkingWord());

  useEffect(() => {
    const id = window.setInterval(() => {
      setWord((prev) => pickRandomThinkingWord(prev));
    }, WORD_ROTATE_MS);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  const label =
    capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;

  return (
    <span className={`inline-flex items-baseline gap-0 ${className}`}>
      <span>{label}</span>
      <AnimatedEllipsis />
    </span>
  );
}
