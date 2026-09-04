let overlayCount = 0;
const listeners = new Set<() => void>();

export function setPostSchedulerComposerOverlayMounted(mounted: boolean): void {
  overlayCount = Math.max(0, overlayCount + (mounted ? 1 : -1));
  listeners.forEach((listener) => listener());
}

export function subscribePostSchedulerComposerOverlay(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isPostSchedulerComposerOverlayOpen(): boolean {
  return overlayCount > 0;
}
