import { useEffect, useRef, useState } from "react";

import { runWorkspaceAgentBubbleLoop } from "../_components/workspaceAgentBubbleLoop";

/**
 * One hint shortly after load, then more on random intervals. Pauses while panel is open.
 */
export function useWorkspaceAgentCapabilityBubbles(
  enabled: boolean,
  panelOpen: boolean,
): string | null {
  const [message, setMessage] = useState<string | null>(null);
  const panelOpenRef = useRef(panelOpen);

  useEffect(() => {
    panelOpenRef.current = panelOpen;
  }, [panelOpen]);

  useEffect(() => {
    if (!enabled) {
      setMessage(null);
      return;
    }

    const controller = new AbortController();
    void runWorkspaceAgentBubbleLoop(controller.signal, panelOpenRef, setMessage);

    return () => {
      controller.abort();
      setMessage(null);
    };
  }, [enabled]);

  useEffect(() => {
    if (panelOpen) {
      setMessage(null);
    }
  }, [panelOpen]);

  return message;
}
