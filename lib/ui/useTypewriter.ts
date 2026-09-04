"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Simulated streaming typewriter effect.
 *
 * Takes the full `text` and reveals it character by character at `charDelayMs`
 * intervals. When `active` is false the full text is returned immediately
 * (used for history messages that should not animate).
 *
 * @param text        The complete text to stream.
 * @param active      Whether to animate. False = return full text instantly.
 * @param charDelayMs Milliseconds between each character (default 16ms ≈ 60 chars/sec).
 *
 * @returns `{ displayed, done }` — `displayed` is the current visible slice,
 *          `done` is true once the full text has been revealed.
 */
export function useTypewriter(
  text: string,
  active: boolean,
  charDelayMs = 16,
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState(() => (active ? "" : text));
  const [done, setDone] = useState(!active);

  // Track the latest text/active so the interval always reads fresh values
  const textRef = useRef(text);
  const activeRef = useRef(active);
  textRef.current = text;
  activeRef.current = active;

  useEffect(() => {
    // Not animating — show full text immediately
    if (!active) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    // Reset when a new active text arrives
    setDisplayed("");
    setDone(false);

    let index = 0;

    const id = window.setInterval(() => {
      index += 1;
      const slice = textRef.current.slice(0, index);
      setDisplayed(slice);

      if (index >= textRef.current.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, charDelayMs);

    return () => {
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active]);

  return { displayed, done };
}
