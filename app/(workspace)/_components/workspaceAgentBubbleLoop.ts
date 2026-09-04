import type { MutableRefObject } from "react";

import {
  pickRandomCapabilityHint,
  WORKSPACE_AGENT_CAPABILITY_AFTER_WELCOME_GAP_MS,
  WORKSPACE_AGENT_CAPABILITY_DISPLAY_MS,
  WORKSPACE_AGENT_CAPABILITY_RANDOM_MAX_MS,
  WORKSPACE_AGENT_CAPABILITY_RANDOM_MIN_MS,
  WORKSPACE_AGENT_CAPABILITY_WELCOME_DELAY_MS,
} from "./workspaceAgentCapabilityHints";

function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(resolve, ms);
    const onAbort = (): void => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export async function runWorkspaceAgentBubbleLoop(
  signal: AbortSignal,
  panelOpenRef: MutableRefObject<boolean>,
  setMessage: (value: string | null) => void,
): Promise<void> {
  let lastHint: string | undefined;

  const showThenHide = async (): Promise<void> => {
    const next = pickRandomCapabilityHint(lastHint);
    lastHint = next;
    setMessage(next);
    try {
      await abortableDelay(WORKSPACE_AGENT_CAPABILITY_DISPLAY_MS, signal);
    } catch {
      return;
    }
    setMessage(null);
  };

  try {
    await abortableDelay(WORKSPACE_AGENT_CAPABILITY_WELCOME_DELAY_MS, signal);
    while (!signal.aborted && panelOpenRef.current) {
      await abortableDelay(400, signal);
    }
    if (signal.aborted) return;

    await showThenHide();
    await abortableDelay(WORKSPACE_AGENT_CAPABILITY_AFTER_WELCOME_GAP_MS, signal);

    while (!signal.aborted) {
      while (!signal.aborted && panelOpenRef.current) {
        setMessage(null);
        await abortableDelay(500, signal);
      }
      if (signal.aborted) return;

      const wait =
        WORKSPACE_AGENT_CAPABILITY_RANDOM_MIN_MS +
        Math.random() *
          (WORKSPACE_AGENT_CAPABILITY_RANDOM_MAX_MS -
            WORKSPACE_AGENT_CAPABILITY_RANDOM_MIN_MS);
      await abortableDelay(wait, signal);
      if (signal.aborted) return;
      if (panelOpenRef.current) continue;

      await showThenHide();
    }
  } catch {
    // AbortError
  }
}
