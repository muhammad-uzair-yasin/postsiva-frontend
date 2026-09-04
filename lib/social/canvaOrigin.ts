function normalizeOriginKey(origin: string): string | null {
  try {
    const url = new URL(origin);
    const host = url.hostname.replace(/^www\./i, "");
    return `${url.protocol}//${host}${url.port ? `:${url.port}` : ""}`;
  } catch {
    return null;
  }
}

function parseCanvaPopupName(name: string): string | null {
  const raw = (name || "").trim();
  if (!raw.startsWith("postsiva-canva-edit|")) {
    return null;
  }
  const parts = raw.split("|").slice(1);
  for (const part of parts) {
    if (part.startsWith("origin=")) {
      const encoded = part.slice("origin=".length);
      if (!encoded) {
        return null;
      }
      try {
        const value = decodeURIComponent(encoded);
        return value.trim() || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function canvaOriginsMatch(a: string, b: string): boolean {
  const left = normalizeOriginKey(a);
  const right = normalizeOriginKey(b);
  return Boolean(left && right && left === right);
}

export function canvaReturnTargetOrigin(): string {
  if (typeof window !== "undefined") {
    const fromName = parseCanvaPopupName(window.name);
    if (fromName) {
      return fromName;
    }
    return window.location.origin;
  }
  return "*";
}

export function buildCanvaPopupName(openerOrigin: string, sessionId: string): string {
  return `postsiva-canva-edit|session=${encodeURIComponent(sessionId.trim())}|origin=${encodeURIComponent(openerOrigin.trim())}`;
}
