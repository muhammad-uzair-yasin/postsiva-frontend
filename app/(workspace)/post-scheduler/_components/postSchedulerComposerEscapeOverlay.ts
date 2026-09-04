/** Nested dialogs inside the composer modal (AI expand, quick prompts, etc.). */
export const COMPOSER_ESCAPE_OVERLAY_ATTR = "data-composer-escape-overlay";

export function hasComposerEscapeOverlay(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return document.querySelector(`[${COMPOSER_ESCAPE_OVERLAY_ATTR}]`) !== null;
}

/** Close only this overlay; block composer / AI drawer Escape handlers. */
export function bindComposerEscapeOverlay(
  open: boolean,
  onClose: () => void,
): () => void {
  if (!open) {
    return () => {};
  }
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== "Escape") {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    onClose();
  };
  window.addEventListener("keydown", onKey, true);
  return () => {
    window.removeEventListener("keydown", onKey, true);
  };
}
