"use client";

import { useState, type ReactElement } from "react";

import { DraftEditorActionConfirmModal } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorActionConfirmModal";
import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceApiKeys } from "../_hooks/useWorkspaceApiKeys";
import { ApiKeyCreatedModal } from "./ApiKeyCreatedModal";
import { ApiKeyRow } from "./ApiKeyRow";
import { CreateApiKeyModal } from "./CreateApiKeyModal";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

export function ApiKeysSettingsClient(): ReactElement {
  const { t } = useTranslations();
  const {
    keys,
    loading,
    error,
    busy,
    refresh,
    createKey,
    revealKeySecret,
    revokeKey,
  } = useWorkspaceApiKeys();
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [revealedKeyName, setRevealedKeyName] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [keyNameDraft, setKeyNameDraft] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast, toastKey, dismissToast, showToast } = useDraftActionSuccessToast();

  return (
    <SettingsSectionPanel title={t("settings.apiKeys")}>
      <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">
        {t("settings.apiKeysIntro")}{" "}
        {t("settings.apiKeysIntroExtra")}{" "}
        {t("settings.apiKeysAuthHint")}
      </p>

      {loading ? <p className="text-sm text-on-surface-variant">{t("common.loading")}</p> : null}

      {createError ? (
        <p className="mt-4 text-sm text-error">{createError}</p>
      ) : null}

      {revealError ? (
        <p className="mt-4 text-sm text-error">{revealError}</p>
      ) : null}

      {error ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-error">{error}</p>
          <button
            type="button"
            className="w-fit rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
            onClick={() => void refresh()}
          >
            {t("common.retry")}
          </button>
        </div>
      ) : null}

      {!loading && !error && keys.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{t("settings.apiKeysEmpty")}</p>
      ) : null}

      {!loading && !error
        ? keys.map((k) => (
            <ApiKeyRow
              busy={busy}
              item={k}
              key={k.id}
              onViewKeyClick={() => {
                setRevealError(null);
                setRevealedKeyName(k.name);
                setRevealedSecret(null);
                void (async () => {
                  try {
                    const secret = await revealKeySecret(k.id);
                    setRevealedSecret(secret);
                  } catch (e) {
                    setRevealError(
                      e instanceof Error ? e.message : t("common.somethingWrong"),
                    );
                  }
                })();
              }}
              onDeleteClick={() => {
                setDeleteConfirmId(k.id);
              }}
            />
          ))
        : null}

      <button
        type="button"
        disabled={busy || loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-4 text-sm font-bold text-on-primary-container disabled:opacity-50"
        onClick={() => {
          setKeyNameDraft("");
          setCreateModalOpen(true);
        }}
      >
        {busy
          ? t("settings.apiKeysWorking")
          : keys.length > 0
            ? t("settings.apiKeysGenerateAnother")
            : t("settings.apiKeysGenerate")}
      </button>

      <CreateApiKeyModal
        open={createModalOpen}
        name={keyNameDraft}
        onNameChange={setKeyNameDraft}
        busy={busy}
        onCancel={() => {
          setCreateModalOpen(false);
        }}
        onConfirm={() => {
          void (async () => {
            setCreateError(null);
            setRevealError(null);
            const label = keyNameDraft.trim();
            try {
              const secret = await createKey(label.length > 0 ? label : null, "full");
              setRevealedKeyName(label.length > 0 ? label : null);
              setRevealedSecret(secret);
              setCreateModalOpen(false);
              showToast(
                t("settings.apiKeysCreatedToast"),
                t("settings.apiKeysCreatedToastHint"),
              );
            } catch (e) {
              setCreateError(
                e instanceof Error ? e.message : t("common.somethingWrong"),
              );
            }
          })();
        }}
      />

      <DraftEditorActionConfirmModal
        open={deleteConfirmId !== null}
        title={t("settings.apiKeysDeleteTitle")}
        description={t("settings.apiKeysDeleteBody")}
        confirmLabel={t("common.delete")}
        isDanger
        isBusy={busy}
        onConfirm={() => {
          const id = deleteConfirmId;
          setDeleteConfirmId(null);
          if (id) {
            void (async () => {
              await revokeKey(id);
              showToast(
                t("settings.apiKeysDeletedToast"),
                t("settings.apiKeysDeletedToastHint"),
              );
            })();
          }
        }}
        onCancel={() => {
          setDeleteConfirmId(null);
        }}
      />

      <ApiKeyCreatedModal
        key={revealedSecret ?? "closed"}
        open={revealedSecret !== null}
        secret={revealedSecret ?? ""}
        keyName={revealedKeyName}
        onClose={() => {
          setRevealedSecret(null);
          setRevealedKeyName(null);
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
    </SettingsSectionPanel>
  );
}
