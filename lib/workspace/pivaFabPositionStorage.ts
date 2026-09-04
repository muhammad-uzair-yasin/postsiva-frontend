/** Device preference — survive refresh and login/logout (not cleared with auth). */
export const PIVA_FAB_POSITION_STORAGE_KEY = "postsiva:piva-fab-position";

export interface PivaFabPosition {
  x: number;
  y: number;
}

const FAB_SAFE_MARGIN = 16;

export function fabSizePx(): number {
  if (typeof window === "undefined") {
    return 80;
  }
  return window.innerWidth >= 640 ? 80 : 64;
}

export function clampPivaFabPosition(position: PivaFabPosition): PivaFabPosition {
  if (typeof window === "undefined") {
    return position;
  }
  const size = fabSizePx();
  return {
    x: Math.min(
      Math.max(FAB_SAFE_MARGIN, position.x),
      Math.max(FAB_SAFE_MARGIN, window.innerWidth - size - FAB_SAFE_MARGIN),
    ),
    y: Math.min(
      Math.max(FAB_SAFE_MARGIN, position.y),
      Math.max(FAB_SAFE_MARGIN, window.innerHeight - size - FAB_SAFE_MARGIN),
    ),
  };
}

export function defaultPivaFabPosition(): PivaFabPosition {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }
  const size = fabSizePx();
  return clampPivaFabPosition({
    x: window.innerWidth - size - 24,
    y: window.innerHeight - size - 24,
  });
}

export function readPivaFabPosition(): PivaFabPosition {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }
  const fallback = defaultPivaFabPosition();
  const stored = window.localStorage.getItem(PIVA_FAB_POSITION_STORAGE_KEY);
  if (!stored) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(stored) as Partial<PivaFabPosition>;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return clampPivaFabPosition({ x: parsed.x, y: parsed.y });
    }
  } catch {
    // ignore corrupt value
  }
  return fallback;
}

export function writePivaFabPosition(position: PivaFabPosition): PivaFabPosition {
  const clamped = clampPivaFabPosition(position);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      PIVA_FAB_POSITION_STORAGE_KEY,
      JSON.stringify(clamped),
    );
  }
  return clamped;
}
