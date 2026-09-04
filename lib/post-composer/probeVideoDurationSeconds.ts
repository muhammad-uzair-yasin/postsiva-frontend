/** Read video duration from a remote URL using a temporary <video> element. */
export function probeVideoDurationFromUrl(url: string): Promise<number | null> {
  if (typeof document === "undefined" || !url.trim()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.crossOrigin = "anonymous";

    let settled = false;
    const finish = (value: number | null): void => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(null), 15_000);

    video.onloadedmetadata = () => {
      const duration = video.duration;
      finish(Number.isFinite(duration) && duration > 0 ? duration : null);
    };
    video.onerror = () => finish(null);
    video.src = url;
  });
}

/** Read video duration from a local File before upload completes. */
export async function probeVideoDurationFromFile(file: File): Promise<number | null> {
  if (!file.type.startsWith("video/")) {
    return null;
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    return await probeVideoDurationFromUrl(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
