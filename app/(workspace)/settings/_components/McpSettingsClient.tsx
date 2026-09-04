"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";

import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { getMcpBaseUrl } from "@/lib/api/config";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { usePostsivaMcpTools } from "../_hooks/usePostsivaMcpTools";
import { useMcpCopyWithApiKey } from "../_hooks/useMcpCopyWithApiKey";
import { useWorkspaceApiKeys } from "../_hooks/useWorkspaceApiKeys";
import { PlatformMcpsCatalog } from "./PlatformMcpsCatalog";
import { SelectApiKeyForMcpModal } from "./SelectApiKeyForMcpModal";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

export function McpSettingsClient(): ReactElement {
  const { t } = useTranslations();
  const baseUrl = useMemo(() => getMcpBaseUrl(), []);
  const [needKeyHint, setNeedKeyHint] = useState(false);
  const [toolsApiKey, setToolsApiKey] = useState<string | null>(null);
  const { keys, loading: keysLoading, busy: keysBusy, revealKeySecret } = useWorkspaceApiKeys();
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();

  useEffect(() => {
    if (keysLoading || keys.length === 0) {
      setToolsApiKey(null);
      return;
    }
    let cancelled = false;
    void revealKeySecret(keys[0].id)
      .then((secret) => {
        if (!cancelled) {
          setToolsApiKey(secret);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToolsApiKey(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [keys, keysLoading, revealKeySecret]);

  const {
    copiedKey,
    copyBusy,
    copyError,
    pickerOpen,
    copyUrlWithApiKey,
    onPickerSelect,
    cancelPicker,
    displayUrl,
    copyPlain,
  } = useMcpCopyWithApiKey({
    pastedApiKey: "",
    keys,
    keysLoading,
    revealKeySecret,
    onNeedApiKey: () => setNeedKeyHint(true),
  });
  const { loading, error, data, refresh } = usePostsivaMcpTools(baseUrl, toolsApiKey);

  const configSnippet = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            "unified-mcp": {
              url: baseUrl,
              headers: { "X-API-Key": "<your workspace API key>" },
            },
          },
        },
        null,
        2,
      ),
    [baseUrl],
  );

  return (
    <SettingsSectionPanel title={t("settings.mcpTitle")}>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-secondary">
        {t("settings.mcpRemote")}
      </p>
      <PlatformMcpsCatalog
        mcpBaseUrl={baseUrl}
        copiedKey={copiedKey}
        copyBusy={copyBusy || keysBusy}
        displayUrl={displayUrl}
        onCopyUrlWithKey={(url, id) => {
          void copyUrlWithApiKey(url, id).then((ok) => {
            if (ok) {
              showToast(t("settings.mcpCopiedToastTitle"), t("settings.mcpCopiedToastHint"));
            }
          });
        }}
        onCopyPlain={(value, id) => {
          void copyPlain(value, id).then((ok) => {
            if (ok) {
              showToast(t("settings.mcpCopiedToastTitle"), t("settings.mcpCopiedToastHint"));
            }
          });
        }}
      />
      <SelectApiKeyForMcpModal
        open={pickerOpen}
        keys={keys}
        busy={copyBusy || keysBusy}
        onSelect={(keyId) => {
          void onPickerSelect(keyId).then((ok) => {
            if (ok) {
              showToast(t("settings.mcpCopiedToastTitle"), t("settings.mcpCopiedToastHint"));
            }
          });
        }}
        onCancel={cancelPicker}
      />
      {copyError ? <p className="mt-2 text-xs text-error">{copyError}</p> : null}
      {needKeyHint ? (
        <p className="mt-2 text-xs text-on-surface-variant">{t("settings.mcpNeedApiKeyHint")}</p>
      ) : null}

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold text-on-surface">{t("settings.mcpTools")}</p>
          <button
            type="button"
            className="text-xs font-bold text-primary"
            onClick={() => void refresh()}
          >
            {t("settings.mcpRefresh")}
          </button>
        </div>
        {keysLoading || (keys.length > 0 && !toolsApiKey) ? (
          <p className="text-sm text-on-surface-variant">{t("settings.mcpLoadingTools")}</p>
        ) : !toolsApiKey ? (
          <p className="text-sm text-on-surface-variant">{t("settings.mcpAddKeyToLoad")}</p>
        ) : loading ? (
          <p className="text-sm text-on-surface-variant">{t("settings.mcpLoadingTools")}</p>
        ) : error ? (
          <p className="text-sm text-error">{error}</p>
        ) : data ? (
          <ul className="space-y-2">
            {data.tools.map((tool) => (
              <li
                key={tool.name}
                className="rounded-lg border border-outline-variant/10 bg-surface-container-low px-3 py-2"
              >
                <span className="text-sm font-bold text-on-surface">{tool.name}</span>
                <p className="text-xs text-on-surface-variant">{tool.description}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="mb-2 mt-8 text-sm font-bold text-on-surface">{t("settings.mcpConfigTitle")}</p>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
        {configSnippet}
      </pre>
      <button
        type="button"
        className="mt-2 text-xs font-bold text-primary"
        onClick={() => {
          void navigator.clipboard.writeText(configSnippet).then(() => {
            showToast(t("settings.mcpCopiedToastTitle"), t("settings.mcpCopiedToastHint"));
          });
        }}
      >
        {t("settings.mcpCopyJson")}
      </button>

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
