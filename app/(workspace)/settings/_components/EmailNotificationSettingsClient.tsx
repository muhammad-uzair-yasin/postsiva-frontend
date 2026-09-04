"use client";

import type { ReactElement } from "react";

import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { WorkspaceEmailNotificationValues } from "@/lib/settings/workspaceEmailNotificationsApi";

import { useWorkspaceEmailNotifications } from "../_hooks/useWorkspaceEmailNotifications";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

const GROUPS: {
  title: string;
  items: { key: keyof WorkspaceEmailNotificationValues; label: string; hint: string }[];
}[] = [
  {
    title: "notifications.contentActivity",
    items: [
      { key: "draft_saved", label: "notifications.draftSaved", hint: "notifications.draftSavedHint" },
      { key: "post_scheduled", label: "notifications.postScheduled", hint: "notifications.postScheduledHint" },
      { key: "post_published", label: "notifications.postPublished", hint: "notifications.postPublishedHint" },
      { key: "scheduled_post_failed", label: "notifications.scheduledPostFailed", hint: "notifications.scheduledPostFailedHint" },
    ],
  },
  {
    title: "notifications.connections",
    items: [
      { key: "account_connected", label: "notifications.accountConnected", hint: "notifications.accountConnectedHint" },
      { key: "account_disconnected", label: "notifications.accountDisconnected", hint: "notifications.accountDisconnectedHint" },
    ],
  },
  {
    title: "notifications.aiInbox",
    items: [
      { key: "lead_detected", label: "notifications.leadDetected", hint: "notifications.leadDetectedHint" },
    ],
  },
];

export function EmailNotificationSettingsClient(): ReactElement {
  const { t } = useTranslations();
  const { settings, loading, saving, error, setValue, save } = useWorkspaceEmailNotifications();
  const { toast, toastKey, dismissToast, showToast } = useDraftActionSuccessToast();

  return (
    <SettingsSectionPanel title={t("notifications.title")}>
      <p className="mb-2 text-sm text-on-surface-variant">{t("notifications.intro")}</p>
      <p className="mb-8 text-xs text-on-surface-variant">{t("notifications.essential")}</p>
      {loading ? <p className="text-sm text-on-surface-variant">{t("common.loading")}</p> : null}
      {error ? <p className="mb-4 text-sm text-error">{error}</p> : null}
      {settings ? (
        <div className="space-y-8">
          {!settings.is_owner ? (
            <p className="rounded-xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
              {t("notifications.ownerOnly")}
            </p>
          ) : null}
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="mb-3 text-lg font-bold text-on-surface">{t(group.title)}</h2>
              <div className="divide-y divide-outline-variant/15 rounded-xl border border-outline-variant/15">
                {group.items.map((item) => (
                  <label key={item.key} className="flex items-center gap-4 p-4">
                    <span className="flex-1">
                      <span className="block text-sm font-bold text-on-surface">{t(item.label)}</span>
                      <span className="mt-1 block text-xs text-on-surface-variant">{t(item.hint)}</span>
                    </span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-primary"
                      checked={settings[item.key]}
                      disabled={!settings.is_owner || saving}
                      onChange={(event) => setValue(item.key, event.target.checked)}
                    />
                  </label>
                ))}
              </div>
            </section>
          ))}
          <button
            type="button"
            disabled={!settings.is_owner || saving}
            className="rounded-xl bg-primary-container px-4 py-3 text-sm font-bold text-on-primary-container disabled:opacity-50"
            onClick={() => {
              void (async () => {
                const didSave = await save();
                if (didSave) {
                  showToast(
                    t("notifications.saved"),
                    t("notifications.savedHint"),
                  );
                }
              })();
            }}
          >
            {saving ? t("common.saving") : t("notifications.save")}
          </button>
        </div>
      ) : null}
      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </SettingsSectionPanel>
  );
}
