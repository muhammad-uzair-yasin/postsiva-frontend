/**
 * After a successful Publish, clear the create-composer session when the
 * drawer closes — unless the user already changed the draft afterward.
 */

type ClearFn = () => void;
type FingerprintFn = () => string;

let clearFn: ClearFn | null = null;
let fingerprintFn: FingerprintFn | null = null;
let pendingClear = false;
let snapshotFingerprintAtMark: string | null = null;

export function registerComposerSessionClear(
  fn: ClearFn,
  getFingerprint: FingerprintFn,
): () => void {
  clearFn = fn;
  fingerprintFn = getFingerprint;
  return () => {
    if (clearFn === fn) {
      clearFn = null;
    }
    if (fingerprintFn === getFingerprint) {
      fingerprintFn = null;
    }
  };
}

export function markComposerClearOnClose(snapshotFingerprint: string): void {
  pendingClear = true;
  snapshotFingerprintAtMark = snapshotFingerprint;
}

/** Call from composer drawer close. Clears only if draft unchanged since mark. */
export function flushComposerClearOnClose(): void {
  if (!pendingClear) {
    return;
  }
  const current = fingerprintFn?.() ?? "";
  const unchanged =
    snapshotFingerprintAtMark !== null &&
    snapshotFingerprintAtMark === current;
  pendingClear = false;
  snapshotFingerprintAtMark = null;
  if (unchanged && clearFn) {
    clearFn();
  }
}
