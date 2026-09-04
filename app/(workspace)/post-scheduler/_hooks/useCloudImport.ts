"use client";

import { useCallback, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  getCloudTransfer,
  importCloudMedia,
  type CloudProvider,
} from "@/lib/social/cloudStorageApi";

import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";

/** A file to import: the cloud file id plus a display name. */
export interface CloudImportFile {
  fileId: string;
  name: string;
}

export type CloudImportPhase = "idle" | "importing";

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

function toAttachedMedia(
  mediaId: string,
  publicUrl: string,
  mediaTypeRaw: string | null | undefined,
  filename: string,
): ComposerAttachedMedia {
  const mediaType: ComposerAttachedMedia["mediaType"] =
    mediaTypeRaw === "video" ? "video" : mediaTypeRaw === "document" ? "document" : "image";
  return { mediaId, publicUrl, mediaType, filename };
}

async function pollTransfer(
  token: string,
  workspaceId: string,
  transferId: string,
  onProgress: (percent: number) => void,
): Promise<string> {
  const startedAt = Date.now();
  for (;;) {
    const transfer = await getCloudTransfer(token, workspaceId, transferId);
    if (transfer.size_bytes && transfer.size_bytes > 0) {
      onProgress(
        Math.min(100, Math.round((transfer.bytes_transferred / transfer.size_bytes) * 100)),
      );
    }
    if (transfer.status === "completed" && transfer.result_media_id) {
      onProgress(100);
      return transfer.result_media_id;
    }
    if (transfer.status === "failed" || transfer.error_code) {
      throw new Error(transfer.error_code ?? "transfer_failed");
    }
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      throw new Error("transfer_timeout");
    }
    await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

interface UseCloudImportResult {
  phase: CloudImportPhase;
  statusLabel: string | null;
  error: string | null;
  clearError: () => void;
  /**
   * Imports each cloud file for `provider`, polling large transfers to
   * completion before calling `onImported`. Resolves with the number of files
   * successfully imported. Never attaches before storage completes.
   */
  importFiles: (
    provider: CloudProvider,
    files: readonly CloudImportFile[],
    onImported: (media: ComposerAttachedMedia) => void,
  ) => Promise<number>;
}

/**
 * The import → poll → attach half of the cloud media flow, shared by the
 * OneDrive/Dropbox native browser in the composer and the Library "Cloud" tab.
 */
export function useCloudImport(): UseCloudImportResult {
  const { t } = useTranslations();
  const [phase, setPhase] = useState<CloudImportPhase>("idle");
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const importFiles = useCallback(
    async (
      provider: CloudProvider,
      files: readonly CloudImportFile[],
      onImported: (media: ComposerAttachedMedia) => void,
    ): Promise<number> => {
      if (runningRef.current || files.length === 0) {
        return 0;
      }
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setError(t("cloudStorage.errorSignIn"));
        return 0;
      }
      runningRef.current = true;
      setError(null);
      setPhase("importing");
      let imported = 0;
      try {
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          setStatusLabel(
            t("cloudStorage.importingCount", {
              current: String(i + 1),
              total: String(files.length),
            }),
          );
          const result = await importCloudMedia(token, workspaceId, provider, file.fileId, {
            fileName: file.name,
          });
          let mediaId = result.media_id ?? "";
          const publicUrl = result.public_url ?? "";
          if (result.status === "transferring" && result.transfer_id) {
            mediaId = await pollTransfer(token, workspaceId, result.transfer_id, (percent) => {
              setStatusLabel(
                t("cloudStorage.transferProgress", {
                  name: file.name,
                  percent: String(percent),
                }),
              );
            });
          }
          if (!mediaId && !publicUrl) {
            throw new Error("import_no_media");
          }
          onImported(
            toAttachedMedia(
              mediaId,
              publicUrl,
              result.media_type,
              file.name || result.filename || "cloud-media",
            ),
          );
          imported += 1;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : t("cloudStorage.errorImport"));
      } finally {
        runningRef.current = false;
        setPhase("idle");
        setStatusLabel(null);
      }
      return imported;
    },
    [t],
  );

  return { phase, statusLabel, error, clearError, importFiles };
}
