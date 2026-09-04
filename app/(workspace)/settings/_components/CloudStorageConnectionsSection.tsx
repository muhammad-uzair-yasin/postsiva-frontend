"use client";

import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudProvider } from "@/lib/social/cloudStorageApi";

import { AdPlatformDisconnectConfirmModal } from "../../ad-platform/_components/AdPlatformDisconnectConfirmModal";
import { CLOUD_PROVIDER_ITEMS } from "../_data/cloudProviders";
import { useCloudConnections } from "../_hooks/useCloudConnections";
import { CloudStorageConnectionCard } from "./CloudStorageConnectionCard";

/**
 * Settings → Connections "Cloud Storage" section (US7). Google Drive is
 * actionable; OneDrive and Dropbox show as "Coming soon". Rendered as a
 * self-contained region so a provider error never breaks the rest of settings.
 */
export function CloudStorageConnectionsSection(): ReactElement {
  const { t } = useTranslations();
  const {
    loading,
    error,
    connectingProvider,
    disconnectingProvider,
    connect,
    disconnect,
    connectionFor,
  } = useCloudConnections();
  const [pendingDisconnect, setPendingDisconnect] = useState<CloudProvider | null>(null);

  const pendingItem = pendingDisconnect
    ? CLOUD_PROVIDER_ITEMS.find((i) => i.provider === pendingDisconnect)
    : undefined;

  return (
    <section aria-labelledby="cloud-storage-heading" className="mt-8 w-full">
      <div className="mb-3">
        <h3 id="cloud-storage-heading" className="text-base font-bold text-on-surface">
          {t("cloudStorage.sectionTitle")}
        </h3>
        <p className="mt-0.5 text-xs text-on-surface-variant sm:text-sm">
          {t("cloudStorage.sectionSubtitle")}
        </p>
      </div>
      {error ? (
        <p
          className="mb-3 rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-xs font-semibold text-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        {CLOUD_PROVIDER_ITEMS.map((item) => (
          <CloudStorageConnectionCard
            key={item.provider}
            item={item}
            connection={connectionFor(item.provider)}
            isLoading={loading}
            connectPending={connectingProvider === item.provider}
            disconnectPending={disconnectingProvider === item.provider}
            onConnect={() => {
              void connect(item.provider);
            }}
            onDisconnect={() => {
              setPendingDisconnect(item.provider);
            }}
          />
        ))}
      </div>
      <AdPlatformDisconnectConfirmModal
        open={pendingDisconnect !== null}
        platformName={pendingItem?.name ?? "Google Drive"}
        busy={disconnectingProvider !== null}
        error={null}
        onClose={() => {
          if (disconnectingProvider === null) {
            setPendingDisconnect(null);
          }
        }}
        onConfirm={async () => {
          if (!pendingDisconnect) {
            return;
          }
          await disconnect(pendingDisconnect);
          setPendingDisconnect(null);
        }}
      />
    </section>
  );
}
