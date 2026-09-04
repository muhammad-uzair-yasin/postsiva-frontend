"use client";

import { useCallback, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  getCloudTransfer,
  getGooglePickerConfig,
  importCloudMedia,
} from "@/lib/social/cloudStorageApi";
import {
  GooglePickerCancelledError,
  openGoogleDrivePicker,
} from "@/lib/social/googlePicker";

import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";

/** Terminal + in-flight states for the Drive pick → storage → attach flow. */
export type DriveImportPhase = "idle" | "picking" | "importing";

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

function toAttachedMedia(
  mediaId: string,
  publicUrl: string,
  mediaTypeRaw: string | null | undefined,
  filename: string,
): ComposerAttachedMedia {
  const mediaType: ComposerAttachedMedia["mediaType"] =
    mediaTypeRaw === "video"
      ? "video"
      : mediaTypeRaw === "document"
        ? "document"
        : "image";
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
      onProgress(Math.min(100, Math.round((transfer.bytes_transferred / transfer.size_bytes) * 100)));
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

interface UseGoogleDriveImportResult {
  phase: DriveImportPhase;
  /** e.g. "Importing 2 of 3" or a transfer percent label; null when idle. */
  statusLabel: string | null;
  error: string | null;
  clearError: () => void;
  /** Opens the picker and imports each file; calls `onImported` for every stored item. */
  startPick: (onImported: (media: ComposerAttachedMedia) => void) => Promise<void>;
}

/**
 * Google Drive → Postsiva import flow shared by the Library "Cloud" tab and the
 * composer. Opens the Picker, imports each picked file, polls large transfers to
 * completion, and only then hands back Postsiva media. Never attaches early.
 */
export function useGoogleDriveImport(): UseGoogleDriveImportResult {
  const { t } = useTranslations();
  const [phase, setPhase] = useState<DriveImportPhase>("idle");
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startPick = useCallback(
    async (onImported: (media: ComposerAttachedMedia) => void): Promise<void> => {
      if (runningRef.current) {
        return;
      }
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setError(t("cloudStorage.errorSignIn"));
        return;
      }
      runningRef.current = true;
      setError(null);
      setPhase("picking");
      setStatusLabel(null);
      try {
        const config = await getGooglePickerConfig(token, workspaceId);
        const files = await openGoogleDrivePicker(config, {
          title: t("cloudStorage.pickerTitle"),
        });
        if (files.length === 0) {
          return;
        }
        setPhase("importing");
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          setStatusLabel(
            t("cloudStorage.importingCount", {
              current: String(i + 1),
              total: String(files.length),
            }),
          );
          const result = await importCloudMedia(token, workspaceId, "google_drive", file.id, {
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
            toAttachedMedia(mediaId, publicUrl, result.media_type, file.name || result.filename || "drive-media"),
          );
        }
      } catch (e) {
        if (e instanceof GooglePickerCancelledError) {
          return;
        }
        setError(e instanceof Error ? e.message : t("cloudStorage.errorImport"));
      } finally {
        runningRef.current = false;
        setPhase("idle");
        setStatusLabel(null);
      }
    },
    [t],
  );

  return { phase, statusLabel, error, clearError, startPick };
}
