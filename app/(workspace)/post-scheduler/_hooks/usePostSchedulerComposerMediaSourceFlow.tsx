"use client";

import { useEffect, useState, type ReactElement } from "react";

import type { CloudProvider } from "@/lib/social/cloudStorageApi";
import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";
import type { WordPressMediaItem } from "@/lib/social/wordpressMediaApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";
import { useCloudConnections } from "../../settings/_hooks/useCloudConnections";
import { useCanvaConnection } from "../../settings/_hooks/useCanvaConnection";
import { useCanvaReturnHandoff, type CanvaReturnMediaHandler } from "./useCanvaReturnHandoff";
import { useCloudImport, type CloudImportFile } from "./useCloudImport";
import { useGoogleDriveImport } from "./useGoogleDriveImport";
import { usePostSchedulerDeviceMediaUpload } from "./usePostSchedulerDeviceMediaUpload";
import { usePostSchedulerLibraryHandoff } from "./usePostSchedulerLibraryHandoff";
import { usePostSchedulerTrendsHandoff } from "./usePostSchedulerTrendsHandoff";
import { useWordPressEditorResources } from "../../wordpress/blogs/_hooks/useWordPressEditorResources";
import { CloudFolderBrowser } from "../_components/CloudFolderBrowser";
import { PostSchedulerCanvaDesignPickerModal } from "../_components/PostSchedulerCanvaDesignPickerModal";
import { defaultCanvaDesignDimensions } from "../_components/CanvaDesignDimensionsSelect";
import { PostSchedulerMediaLibraryModal } from "../_components/PostSchedulerMediaLibraryModal";
import { PostSchedulerMediaSourcePickerModal } from "../_components/PostSchedulerMediaSourcePickerModal";
import { PostSchedulerStockMediaModal } from "../_components/PostSchedulerStockMediaModal";
import { PostSchedulerWordPressMediaPickerModal } from "../_components/PostSchedulerWordPressMediaPickerModal";

export function usePostSchedulerComposerMediaSourceFlow(input: {
  readonly wordpressConnectionId?: string | null;
  readonly disabled?: boolean;
  readonly onPick: CanvaReturnMediaHandler;
  readonly onDeviceUpload?: (result: UnifiedMediaUploadWebResult) => void;
  readonly libraryOverlayClassName?: string;
  readonly onDismiss?: () => void;
  readonly composerHandoffsEnabled?: boolean;
  /**
   * When true (default), listen for window events that open this flow.
   * Live Preview must pass false so YT/LinkedIn thumbnail "Choose" only
   * opens the composer attach-zone picker (avoids dual modals / first-pick no-op).
   */
  readonly listenToGlobalOpenEvents?: boolean;
}): {
  openSourcePicker: () => void;
  modals: ReactElement;
  fileInput: ReactElement;
  uploading: boolean;
  progress: number;
  hint: string | null;
} {
  const { t } = useTranslations();
  const listenToGlobalOpenEvents = input.listenToGlobalOpenEvents ?? true;
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [wordpressMediaOpen, setWordpressMediaOpen] = useState(false);
  const [cloudBrowserProvider, setCloudBrowserProvider] = useState<CloudProvider | null>(null);
  const [canvaOpen, setCanvaOpen] = useState(false);
  const [canvaDesignDimensions] = useState(defaultCanvaDesignDimensions);

  const drive = useGoogleDriveImport();
  const canvaConnection = useCanvaConnection();
  const { connectingProvider, connect, connectionFor } = useCloudConnections();
  const cloudImport = useCloudImport();
  const wordpressResources = useWordPressEditorResources(input.wordpressConnectionId ?? "");

  const resolvePick: CanvaReturnMediaHandler = (media, opts): void => {
    input.onPick(media, opts);
  };

  const closeAllMediaFlow = (): void => {
    setSourcePickerOpen(false);
    setLibraryOpen(false);
    setStockOpen(false);
    setWordpressMediaOpen(false);
    setCloudBrowserProvider(null);
    setCanvaOpen(false);
  };

  const onDeviceResult = (result: UnifiedMediaUploadWebResult): void => {
    if (input.onDeviceUpload) {
      input.onDeviceUpload(result);
      return;
    }
    resolvePick({
      mediaId: result.mediaId,
      publicUrl: result.publicUrl,
      mediaType: result.mediaType,
      filename: result.filename,
    });
  };

  const {
    fileInputRef,
    uploading,
    progress,
    hint,
    openFilePicker,
    onFileInputChange,
  } = usePostSchedulerDeviceMediaUpload(onDeviceResult);

  const composerHandoffsEnabled = input.composerHandoffsEnabled ?? true;
  usePostSchedulerLibraryHandoff(composerHandoffsEnabled);
  usePostSchedulerTrendsHandoff(composerHandoffsEnabled);
  useCanvaReturnHandoff(resolvePick, closeAllMediaFlow);

  useEffect(() => {
    if (!listenToGlobalOpenEvents) {
      return;
    }
    const handler = (): void => {
      setLibraryOpen(true);
    };
    window.addEventListener("postsiva:open-media-library-images", handler);
    return () => {
      window.removeEventListener("postsiva:open-media-library-images", handler);
    };
  }, [listenToGlobalOpenEvents]);

  useEffect(() => {
    if (!listenToGlobalOpenEvents) {
      return;
    }
    const handler = (): void => {
      setSourcePickerOpen(true);
    };
    window.addEventListener("postsiva:open-media-source-picker", handler);
    return () => {
      window.removeEventListener("postsiva:open-media-source-picker", handler);
    };
  }, [listenToGlobalOpenEvents]);

  const inputDisabled = Boolean(input.disabled) || uploading;

  const pickFromGoogleDrive = (): void => {
    void drive.startPick((media) => {
      resolvePick(media);
    });
  };

  const googleDriveConnected = connectionFor("google_drive")?.status === "connected";
  const oneDriveConnected = connectionFor("onedrive")?.status === "connected";
  const dropboxConnected = connectionFor("dropbox")?.status === "connected";
  const cloudProviderConnected = (provider: CloudProvider): boolean =>
    provider === "google_drive"
      ? googleDriveConnected
      : provider === "onedrive"
        ? oneDriveConnected
        : dropboxConnected;

  const pickCloudProvider = (provider: CloudProvider): void => {
    setSourcePickerOpen(false);
    if (!cloudProviderConnected(provider)) {
      void connect(provider);
      return;
    }
    if (provider === "google_drive") {
      pickFromGoogleDrive();
      return;
    }
    setCloudBrowserProvider(provider);
  };

  const providerLabel = (provider: CloudProvider): string =>
    provider === "onedrive" ? t("cloudStorage.sourceOneDrive") : t("cloudStorage.sourceDropbox");

  const confirmCloudSelection = (files: CloudImportFile[]): void => {
    if (!cloudBrowserProvider || files.length === 0) {
      return;
    }
    void cloudImport
      .importFiles(cloudBrowserProvider, files, (media) => {
        resolvePick(media);
      })
      .then((count) => {
        if (count > 0) {
          setCloudBrowserProvider(null);
        }
      });
  };

  const pickWordPressMedia = (item: WordPressMediaItem): void => {
    if (!item.source_url?.trim()) {
      return;
    }
    resolvePick({
      mediaId: "",
      publicUrl: item.source_url?.trim() ?? "",
      mediaType: item.mime_type?.startsWith("video/") ? "video" : "image",
      filename: item.title || item.slug || `wordpress-media-${item.id}`,
    });
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*,video/*,.pdf,.ppt,.pptx,.doc,.docx,application/pdf"
      multiple
      className="hidden"
      aria-hidden
      disabled={inputDisabled}
      onChange={onFileInputChange}
    />
  );

  const dismissFlow = (): void => {
    input.onDismiss?.();
  };

  const modals = (
    <>
      <PostSchedulerMediaSourcePickerModal
        visible={sourcePickerOpen}
        onClose={() => {
          setSourcePickerOpen(false);
          dismissFlow();
        }}
        onPickDevice={() => {
          setSourcePickerOpen(false);
          openFilePicker();
        }}
        onPickLibrary={() => {
          setSourcePickerOpen(false);
          setLibraryOpen(true);
        }}
        onPickStock={() => {
          setSourcePickerOpen(false);
          setStockOpen(true);
        }}
        onPickCloudProvider={pickCloudProvider}
        cloudProviderStatus={(provider) =>
          cloudProviderConnected(provider) ? "connected" : "not-connected"
        }
        onPickWordPress={
          input.wordpressConnectionId
            ? () => {
                setSourcePickerOpen(false);
                setWordpressMediaOpen(true);
              }
            : undefined
        }
        onPickCanva={() => {
          setSourcePickerOpen(false);
          setCanvaOpen(true);
        }}
        canvaStatus={canvaConnection.connected ? "connected" : "not-connected"}
      />
      <PostSchedulerCanvaDesignPickerModal
        visible={canvaOpen}
        designDimensions={canvaDesignDimensions}
        onBack={() => {
          setCanvaOpen(false);
          setSourcePickerOpen(true);
        }}
        onClose={() => {
          setCanvaOpen(false);
          dismissFlow();
        }}
        onPickMedia={resolvePick}
      />
      <PostSchedulerMediaLibraryModal
        visible={libraryOpen}
        overlayClassName={input.libraryOverlayClassName ?? "z-[1090]"}
        onBack={() => {
          setLibraryOpen(false);
          setSourcePickerOpen(true);
        }}
        onClose={() => {
          setLibraryOpen(false);
          dismissFlow();
        }}
        onPickMedia={resolvePick}
      />
      <PostSchedulerStockMediaModal
        visible={stockOpen}
        onBack={() => {
          setStockOpen(false);
          setSourcePickerOpen(true);
        }}
        onClose={() => {
          setStockOpen(false);
          dismissFlow();
        }}
        onPickMedia={resolvePick}
      />
      <PostSchedulerWordPressMediaPickerModal
        visible={wordpressMediaOpen}
        loading={wordpressResources.loading}
        items={wordpressResources.media}
        onBack={() => {
          setWordpressMediaOpen(false);
          setSourcePickerOpen(true);
        }}
        onClose={() => {
          setWordpressMediaOpen(false);
          dismissFlow();
        }}
        onPick={pickWordPressMedia}
      />
      {cloudBrowserProvider ? (
        <CloudFolderBrowser
          provider={cloudBrowserProvider}
          providerLabel={providerLabel(cloudBrowserProvider)}
          visible
          confirmLabel={t("cloudStorage.importSelected")}
          busy={cloudImport.phase !== "idle"}
          statusLabel={
            connectingProvider === cloudBrowserProvider
              ? t("adPlatform.cardConnecting")
              : cloudImport.statusLabel
          }
          importError={cloudImport.error}
          reconnectRequired={!cloudProviderConnected(cloudBrowserProvider)}
          onReconnect={() => {
            void connect(cloudBrowserProvider);
          }}
          onClose={() => {
            setCloudBrowserProvider(null);
          }}
          onConfirm={confirmCloudSelection}
        />
      ) : null}
    </>
  );

  return {
    openSourcePicker: () => {
      setSourcePickerOpen(true);
    },
    modals,
    fileInput,
    uploading,
    progress,
    hint,
  };
}
