"use client";

import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudProvider } from "@/lib/social/cloudStorageApi";

import { AdPlatformDisconnectConfirmModal } from "../../ad-platform/_components/AdPlatformDisconnectConfirmModal";
import { CLOUD_PROVIDER_ITEMS } from "../../settings/_data/cloudProviders";
import { useCloudConnections } from "../../settings/_hooks/useCloudConnections";
import { CloudStorageConnectionCard } from "../../settings/_components/CloudStorageConnectionCard";

export function AccountsCloudStorageSection(): ReactElement {
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
    <section aria-labelledby="accounts-cloud-heading" className="flex flex-col gap-2">
      <div className="mt-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">cloud</span>
        <h2 id="accounts-cloud-heading" className="text-xs font-bold uppercase text-on-surface-variant">
          {t("cloudStorage.sectionTitle")}
        </h2>
        <span className="text-xs text-on-surface-variant/70">{CLOUD_PROVIDER_ITEMS.length}</span>
      </div>
      {error ? (
        <p
          className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
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
        platformName={pendingItem?.name ?? "Cloud storage"}
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
