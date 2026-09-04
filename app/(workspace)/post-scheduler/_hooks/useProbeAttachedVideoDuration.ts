import { useEffect, useState } from "react";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { probeVideoDurationFromUrl } from "@/lib/post-composer/probeVideoDurationSeconds";

function attachedMediaKey(item: ComposerAttachedMedia): string {
  return item.mediaId || item.publicUrl;
}

/** Probe missing video duration from the attached video URL and persist on the draft. */
export function useProbeAttachedVideoDuration(
  media: readonly ComposerAttachedMedia[],
  setMedia: (updater: (prev: ComposerAttachedMedia[]) => ComposerAttachedMedia[]) => void,
): { readonly probing: boolean } {
  const [probing, setProbing] = useState(false);

  useEffect(() => {
    const video = media.find(
      (m) => m.mediaType === "video" && m.durationSeconds == null && m.publicUrl.trim(),
    );
    if (!video) {
      setProbing(false);
      return;
    }

    let cancelled = false;
    setProbing(true);
    const key = attachedMediaKey(video);

    void probeVideoDurationFromUrl(video.publicUrl).then((duration) => {
      if (cancelled || duration == null) {
        if (!cancelled) {
          setProbing(false);
        }
        return;
      }
      setMedia((prev) =>
        prev.map((item) =>
          attachedMediaKey(item) === key
            ? { ...item, durationSeconds: duration }
            : item,
        ),
      );
      if (!cancelled) {
        setProbing(false);
      }
    });

    return () => {
      cancelled = true;
      setProbing(false);
    };
  }, [media, setMedia]);

  return { probing };
}
