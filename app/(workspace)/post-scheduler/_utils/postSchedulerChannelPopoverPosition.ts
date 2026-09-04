const POPOVER_WIDTH_PX = 320;
const GAP_PX = 8;
const MARGIN_PX = 8;

/** Viewport position: directly under trigger, clamped; right-aligns to + if needed near edge. */
export function popoverPositionUnderTrigger(
  trigger: DOMRect,
): { top: number; left: number } {
  const vw = window.innerWidth;
  let left = trigger.left;
  if (left + POPOVER_WIDTH_PX > vw - MARGIN_PX) {
    left = trigger.right - POPOVER_WIDTH_PX;
  }
  left = Math.max(
    MARGIN_PX,
    Math.min(left, vw - POPOVER_WIDTH_PX - MARGIN_PX),
  );
  return { top: trigger.bottom + GAP_PX, left };
}
