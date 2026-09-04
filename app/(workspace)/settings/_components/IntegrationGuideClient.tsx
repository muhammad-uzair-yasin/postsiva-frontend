"use client";

import Link from "next/link";
import { useState, type ReactElement } from "react";

import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { getMcpBaseUrl } from "@/lib/api/config";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useIntegrationSetup } from "../_hooks/useIntegrationSetup";
import { useMcpCopyWithApiKey } from "../_hooks/useMcpCopyWithApiKey";
import { useWorkspaceApiKeys } from "../_hooks/useWorkspaceApiKeys";
import { copyTextToClipboard } from "../_utils/copyTextToClipboard";
import { CreateApiKeyModal } from "./CreateApiKeyModal";
import { PlatformMcpsCatalog } from "./PlatformMcpsCatalog";
import { SelectApiKeyForMcpModal } from "./SelectApiKeyForMcpModal";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

export function IntegrationGuideClient({ slug }: { slug: string }): ReactElement {
  const { t } = useTranslations();
  const data = useIntegrationSetup(slug);
  const [copiedKey, setCopiedKey] = useState("");

  const copy = async (value: string, key: string): Promise<void> => {
    const ok = await copyTextToClipboard(value);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    }
  };

  if (!data) {
    return (
      <SettingsSectionPanel title={t("settings.integrationGuideTitle")}>
        <p className="text-sm text-on-surface-variant">{t("settings.integrationGuideNotFound")}</p>
      </SettingsSectionPanel>
    );
  }

  return (
    <div>
      <SettingsSectionPanel title={data.name}>
      <p className="text-sm text-on-surface-variant">{data.subtitle}</p>
      {data.longDescription ? (
        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{data.longDescription}</p>
      ) : null}
      {data.externalCta ? (
        <a
          href={data.externalCta.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
        >
          {data.externalCta.label}
        </a>
      ) : null}

      {slug === "mcp" ? <McpGuideConfig /> : null}

      {data.tabs.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {data.tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={tab.onSelect}
              className={`rounded-xl px-3 py-2 text-xs font-bold ${
                tab.active ? "bg-primary-container text-on-primary-container" : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      {data.steps.length ? (
        <div className="mt-10 space-y-4">
          <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">
            {t("settings.integrationGuideSetup")}
          </h2>
          <div className={`grid gap-4 ${slug === "mcp" ? "md:grid-cols-3" : ""}`}>
            {data.steps.map((step, index) => (
              <div
                key={`${step.title}-${index}`}
                className={`rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4 ${
                  slug === "mcp" ? "h-full" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-on-surface">{step.title}</p>
                    <p className="mt-2 text-xs leading-5 text-on-surface-variant">{step.content}</p>
                  </div>
                </div>
                {step.subsections?.map((sub, subIndex) => (
                  <div key={`${sub.title}-${subIndex}`} className="mt-3 pl-11">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-on-surface">{sub.title}</span>
                      {sub.title.toLowerCase().includes("api key") ? (
                        <Link href="/integrations/api-keys" className="text-xs font-bold text-primary">
                          {t("settings.integrationGuideManage")}
                        </Link>
                      ) : null}
                    </div>
                    <p className="mt-1 rounded-lg bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant">
                      {sub.body}
                    </p>
                    {sub.copyValue ? (
                      <button
                        type="button"
                        className="mt-1 text-[11px] font-bold text-primary"
                        onClick={() => void copy(sub.copyValue ?? sub.body, `${index}-${subIndex}`)}
                      >
                        {copiedKey === `${index}-${subIndex}` ? t("common.copied") : t("settings.integrationGuideCopy")}
                      </button>
                    ) : null}
                  </div>
                ))}
                {step.codeBlock ? (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                    {step.codeBlock}
                  </pre>
                ) : null}
                {step.note ? (
                  <p className="mt-2 text-xs italic text-on-surface-variant">
                    {t("settings.integrationGuideNote", { note: step.note })}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.prompts.length ? (
        <div className="mt-10 space-y-4">
          <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">
            {t("settings.integrationGuideTryItOut")}
          </h2>
          <div className={`grid gap-3 ${slug === "mcp" ? "sm:grid-cols-2" : ""}`}>
            {data.prompts.map((prompt, index) => (
              <div
                key={`${prompt}-${index}`}
                className="group rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4 transition-colors hover:border-primary/25"
              >
                <p className="text-xs leading-5 text-on-surface">{prompt}</p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-surface-container-highest px-2.5 py-1.5 text-[11px] font-bold text-primary opacity-80 transition-opacity group-hover:opacity-100"
                  onClick={() => void copy(prompt, `prompt-${index}`)}
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  {copiedKey === `prompt-${index}` ? t("common.copied") : t("settings.integrationGuideCopyPrompt")}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      </SettingsSectionPanel>
    </div>
  );
}

function McpGuideConfig(): ReactElement {
  const { t } = useTranslations();
  const { toast, toastKey, dismissToast, showToast } = useDraftActionSuccessToast();
  const showCopiedToast = (): void => {
    showToast(t("settings.mcpCopiedToastTitle"), t("settings.mcpCopiedToastHint"));
  };
  const { keys, loading: keysLoading, busy, createKey, revealKeySecret } = useWorkspaceApiKeys();
  const [generatedApiKey, setGeneratedApiKey] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [keyNameDraft, setKeyNameDraft] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [needKeyHint, setNeedKeyHint] = useState(false);
  const mcpBaseUrl = getMcpBaseUrl();
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
    pastedApiKey: generatedApiKey,
    keys,
    keysLoading,
    revealKeySecret,
    onNeedApiKey: () => setNeedKeyHint(true),
  });
  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        "unified-mcp": {
          url: mcpBaseUrl,
          headers: { "X-API-Key": generatedApiKey.trim() || "API_KEY" },
        },
      },
    },
    null,
    2,
  );

  const copy = async (value: string, key: string): Promise<void> => {
    const ok = await copyPlain(value, key);
    if (ok) {
      showCopiedToast();
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <section className="overflow-hidden rounded-2xl border border-outline-variant/15 bg-gradient-to-br from-surface-container-low via-surface-container-low to-primary/5 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              <span className="material-symbols-outlined text-sm">key</span>
              {t("settings.mcpConfigBlockTitle")}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {t("settings.mcpConfigBlockHint")}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-lg shadow-primary/20 disabled:opacity-60"
            onClick={() => {
              setCreateError(null);
              setNeedKeyHint(false);
              setKeyNameDraft("Postsiva MCP");
              setCreateModalOpen(true);
            }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            {busy ? t("settings.mcpGeneratingKey") : t("settings.mcpGenerateKey")}
          </button>
        </div>

        {createError ? <p className="mt-4 text-xs text-error">{createError}</p> : null}
        {copyError ? <p className="mt-4 text-xs text-error">{copyError}</p> : null}
        {needKeyHint ? (
          <p className="mt-4 rounded-lg border border-secondary/20 bg-secondary/5 px-3 py-2 text-xs text-on-surface-variant">
            {t("settings.mcpNeedApiKeyHint")}
          </p>
        ) : null}
      </section>

      <PlatformMcpsCatalog
        mcpBaseUrl={mcpBaseUrl}
        apiKey={generatedApiKey}
        copiedKey={copiedKey}
        copyBusy={copyBusy || busy}
        displayUrl={displayUrl}
        onCopyUrlWithKey={(baseUrl, id) => {
          void copyUrlWithApiKey(baseUrl, id).then((ok) => {
            if (ok) {
              showCopiedToast();
            }
          });
        }}
        onCopyPlain={(value, id) => void copy(value, id)}
      />

      <SelectApiKeyForMcpModal
        open={pickerOpen}
        keys={keys}
        busy={copyBusy || busy}
        onSelect={(keyId) => {
          void onPickerSelect(keyId).then((ok) => {
            if (ok) {
              showCopiedToast();
            }
          });
        }}
        onCancel={cancelPicker}
      />

      <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest ring-1 ring-outline-variant/10">
            <span className="material-symbols-outlined text-lg text-primary">data_object</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-on-surface">{t("settings.mcpConfigTitle")}</h3>
            <p className="mt-1 text-xs leading-5 text-on-surface-variant">{t("settings.mcpLocalHint")}</p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-surface-container-highest px-3 py-1.5 text-[11px] font-bold text-primary"
            onClick={() => void copy(mcpConfigJson, "mcp-json")}
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            {copiedKey === "mcp-json" ? t("common.copied") : t("settings.mcpCopyJson")}
          </button>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-outline-variant/10 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
          {mcpConfigJson}
        </pre>
      </section>

      <CreateApiKeyModal
        open={createModalOpen}
        name={keyNameDraft}
        onNameChange={setKeyNameDraft}
        busy={busy}
        onCancel={() => setCreateModalOpen(false)}
        onConfirm={() => {
          void (async () => {
            setCreateError(null);
            try {
              const label = keyNameDraft.trim();
              const secret = await createKey(label.length > 0 ? label : null, "full");
              setGeneratedApiKey(secret);
              setNeedKeyHint(false);
              setCreateModalOpen(false);
            } catch (e) {
              setCreateError(e instanceof Error ? e.message : t("common.somethingWrong"));
            }
          })();
        }}
      />
      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </div>
  );
}
