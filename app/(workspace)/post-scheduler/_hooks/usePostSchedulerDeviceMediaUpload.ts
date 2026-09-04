import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { invalidateUnifiedMediaListCache } from "@/lib/social/unifiedMediaApi";
import { probeVideoDurationFromFile } from "@/lib/post-composer/probeVideoDurationSeconds";
import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";
import { uploadUnifiedWorkspaceMediaFromFile } from "@/lib/social/unifiedMediaUploadWeb";

const MAX_IMAGES_BATCH = 10;

export function usePostSchedulerDeviceMediaUpload(
  onEachUploaded: (result: UnifiedMediaUploadWebResult) => void,
  onBatchComplete?: () => Promise<void>,
): {
  readonly fileInputRef: RefObject<HTMLInputElement | null>;
  readonly uploading: boolean;
  readonly progress: number;
  readonly hint: string | null;
  readonly openFilePicker: () => void;
  readonly onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
} {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hint, setHint] = useState<string | null>(null);

  const runUploads = useCallback(
    async (files: File[]): Promise<void> => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setHint("Sign in and open a workspace to upload.");
        return;
      }
      const videos = files.filter((f) => f.type.startsWith("video/"));
      const documents = files.filter(
        (f) =>
          f.type === "application/pdf" ||
          /\.(pdf|ppt|pptx|doc|docx)$/i.test(f.name),
      );
      const images = files.filter(
        (f) =>
          f.type.startsWith("image/") &&
          !/\.(pdf|ppt|pptx|doc|docx)$/i.test(f.name),
      );
      const queue =
        documents.length > 0
          ? [documents[0]]
          : videos.length > 0
            ? [videos[0]]
            : images.length > 0
              ? images.slice(0, MAX_IMAGES_BATCH)
              : [];

      if (queue.length === 0) {
        setHint("Choose an image, video, or document file.");
        return;
      }

      setUploading(true);
      setProgress(0);
      setHint(null);

      try {
        let index = 0;
        for (const file of queue) {
          index += 1;
          setHint(
            queue.length > 1
              ? `Uploading ${index}/${queue.length}: ${file.name}`
              : file.name,
          );
          const durationSeconds =
            file.type.startsWith("video/")
              ? await probeVideoDurationFromFile(file)
              : undefined;
          const result = await uploadUnifiedWorkspaceMediaFromFile(
            token,
            ws,
            file,
            { onProgress: setProgress },
          );
          onEachUploaded({
            ...result,
            durationSeconds: durationSeconds ?? undefined,
          });
        }
        invalidateUnifiedMediaListCache();
        await onBatchComplete?.();
        setHint(null);
      } catch (e) {
        setHint(
          e instanceof Error ? e.message : "Upload failed. Try again.",
        );
      } finally {
        setUploading(false);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onBatchComplete, onEachUploaded],
  );

  const onFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list?.length) {
        return;
      }
      void runUploads(Array.from(list));
    },
    [runUploads],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    uploading,
    progress,
    hint,
    openFilePicker,
    onFileInputChange,
  };
}
