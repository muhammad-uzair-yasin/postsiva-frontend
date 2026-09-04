"use client";

import { useCallback, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { WorkspaceCardChannelRow } from "@/lib/workspaces/dashboardConnectedChannels";

import { useDisconnectWorkspaceChannel } from "../_hooks/useDisconnectWorkspaceChannel";
import { DisconnectChannelConfirmModal } from "./DisconnectChannelConfirmModal";
import { EditWorkspaceChannelRow } from "./EditWorkspaceChannelRow";

interface PendingDisconnect {
  oauthPlatform: string;
  platformDisplay: string;
  channelLabel: string;
}

interface EditWorkspaceChannelsSectionProps {
  workspaceId: string | null;
  channels: WorkspaceCardChannelRow[];
  isReady: boolean;
  hasWorkspace: boolean;
}

function platformDisplayName(platform: string): string {
  return platform.replace(/_/g, " ");
}

export function EditWorkspaceChannelsSection({
  workspaceId,
  channels,
  isReady,
  hasWorkspace,
}: EditWorkspaceChannelsSectionProps): React.ReactElement | null {
  const { t } = useTranslations();
  const {
    disconnectingPlatform,
    disconnectError,
    clearError,
    runDisconnect,
  } = useDisconnectWorkspaceChannel(workspaceId);

  const [pending, setPending] = useState<PendingDisconnect | null>(null);

  const closeModal = useCallback(() => {
    if (disconnectingPlatform) {
      return;
    }
    clearError();
    setPending(null);
  }, [clearError, disconnectingPlatform]);

  const onConfirmDisconnect = useCallback(async () => {
    if (!pending) {
      return;
    }
    const ok = await runDisconnect(pending.oauthPlatform);
    if (ok) {
      setPending(null);
    }
  }, [pending, runDisconnect]);

  if (!isReady) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-on-surface-variant">{t("workspaces.editChannelsLoading")}</p>
      </section>
    );
  }

  if (!hasWorkspace) {
    return null;
  }

  const countLabel =
    channels.length === 0
      ? t("workspaces.editChannelsNone")
      : channels.length === 1
        ? t("workspaces.editChannelsCountSingle", { count: channels.length })
        : t("workspaces.editChannelsCountPlural", { count: channels.length });

  const modalError = pending ? disconnectError : null;

  return (
    <section className="space-y-4">
      <DisconnectChannelConfirmModal
        open={pending !== null}
        platformDisplay={
          pending ? platformDisplayName(pending.platformDisplay) : ""
        }
        channelLabel={pending?.channelLabel ?? ""}
        busy={Boolean(disconnectingPlatform)}
        error={modalError}
        onClose={closeModal}
        onConfirm={onConfirmDisconnect}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">
          {t("workspaces.editChannelsTitle")}
        </h2>
        <span className="text-xs text-on-surface-variant">{countLabel}</span>
      </div>
      {disconnectError && !pending ? (
        <div
          className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
          role="alert"
        >
          <span>{disconnectError}</span>
          <button
            type="button"
            className="ml-3 font-bold underline"
            onClick={() => {
              clearError();
            }}
          >
            {t("workspaces.dismiss")}
          </button>
        </div>
      ) : null}
      {channels.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-low/50 px-4 py-8 text-center text-sm text-on-surface-variant">
          {t("workspaces.editChannelsEmpty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {channels.map((ch, index) => (
            <EditWorkspaceChannelRow
              key={`${ch.oauthPlatform}-${index}`}
              channel={ch}
              disconnectBusy={Boolean(disconnectingPlatform)}
              onDisconnectClick={() => {
                clearError();
                setPending({
                  oauthPlatform: ch.oauthPlatform,
                  platformDisplay: ch.platform,
                  channelLabel: ch.label,
                });
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
