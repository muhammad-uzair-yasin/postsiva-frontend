"use client";

import { useCallback, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { WorkspaceLocale } from "@/lib/i18n/locales";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { userFacingAiErrorMessage } from "@/lib/ai/userFacingAiError";
import { generateWorkspaceAiPrompt } from "@/lib/settings/workspaceAiPromptsApi";
import { useWorkspaceAiPrompts } from "@/lib/settings/useWorkspaceAiPrompts";

import { DraftEditorSuccessToast } from "../../content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "../../content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { WorkspaceAiPromptGenerateModal } from "./WorkspaceAiPromptGenerateModal";

type EditorMode =
  | { kind: "idle" }
  | { kind: "create" }
  | { kind: "edit"; id: string; title: string; body: string };

export function WorkspaceAiPromptsSettingsBody(): ReactElement {
  const { t } = useTranslations();
  const { items, loading, error, saving, create, update, remove } = useWorkspaceAiPrompts();
  const [editor, setEditor] = useState<EditorMode>({ kind: "idle" });
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const { toast, toastKey, dismissToast, showToast } = useDraftActionSuccessToast();

  const openCreate = useCallback(() => {
    setLocalError(null);
    setFormTitle("");
    setFormBody("");
    setEditor({ kind: "create" });
  }, []);

  const openEdit = useCallback((id: string, title: string, body: string) => {
    setLocalError(null);
    setFormTitle(title);
    setFormBody(body);
    setEditor({ kind: "edit", id, title, body });
  }, []);

  const closeEditor = useCallback(() => {
    if (saving) return;
    setEditor({ kind: "idle" });
  }, [saving]);

  const onSubmit = useCallback(async () => {
    const title = formTitle.trim();
    const body = formBody.trim();
    if (!title || !body) {
      setLocalError(t("settings.aiPrompts.validationRequired"));
      return;
    }
    setLocalError(null);
    try {
      if (editor.kind === "create") {
        await create(title, body);
        showToast(
          t("settings.aiPrompts.toastCreated"),
          t("settings.aiPrompts.toastCreatedHint"),
        );
      } else if (editor.kind === "edit") {
        await update(editor.id, { title, body });
        showToast(
          t("settings.aiPrompts.toastUpdated"),
          t("settings.aiPrompts.toastUpdatedHint"),
        );
      }
      setEditor({ kind: "idle" });
    } catch {
      /* hook sets error */
    }
  }, [create, update, editor, formTitle, formBody, showToast, t]);

  const onGenerateFromAi = useCallback(
    async (intent: string, language: WorkspaceLocale) => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setGenerateError(t("settings.aiPrompts.generateFailed"));
        return;
      }
      setGenerating(true);
      setGenerateError(null);
      try {
        const result = await generateWorkspaceAiPrompt(token, workspaceId, {
          intent,
          language,
        });
        setFormTitle(result.title);
        setFormBody(result.body);
        if (editor.kind === "idle") {
          setEditor({ kind: "create" });
        }
        setGenerateOpen(false);
      } catch (e) {
        setGenerateError(
          userFacingAiErrorMessage(e, {
            aiDown: t("settings.aiPrompts.generateFailed"),
            aiCredits: t("settings.aiPrompts.generateFailed"),
            network: t("settings.aiPrompts.generateFailed"),
            fallback: t("settings.aiPrompts.generateFailed"),
          }),
        );
      } finally {
        setGenerating(false);
      }
    },
    [editor.kind, t],
  );

  return (
    <>
      {loading ? <p className="text-sm text-on-surface-variant">{t("common.loading")}</p> : null}
      {(error || localError) && !loading ? (
        <p className="mb-4 text-sm text-error" role="alert">
          {localError ?? error}
        </p>
      ) : null}

      {!loading && editor.kind === "idle" ? (
        <button
          type="button"
          onClick={openCreate}
          className="mb-6 rounded-xl bg-primary-container px-4 py-3 text-sm font-bold text-on-primary-container"
        >
          {t("settings.aiPrompts.add")}
        </button>
      ) : null}

      {editor.kind !== "idle" ? (
        <div className="mb-8 space-y-4 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-on-surface">
              {editor.kind === "create"
                ? t("settings.aiPrompts.add")
                : t("settings.aiPrompts.edit")}
            </h3>
            <button
              type="button"
              disabled={saving || generating}
              onClick={() => {
                setGenerateError(null);
                setGenerateOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#6B49D8]/35 bg-[#6B49D8]/10 px-3 py-1.5 text-[11px] font-bold text-[#6B49D8] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base leading-none" aria-hidden>
                auto_awesome
              </span>
              {t("settings.aiPrompts.generateWithAi")}
            </button>
          </div>
          <label className="block">
            <span className="text-xs font-bold text-on-surface">{t("settings.aiPrompts.titleLabel")}</span>
            <input
              type="text"
              maxLength={200}
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-on-surface">{t("settings.aiPrompts.bodyLabel")}</span>
            <textarea
              rows={10}
              maxLength={4000}
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              className="mt-1 min-h-48 w-full rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void onSubmit()}
              className="rounded-xl bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
            >
              {saving ? t("common.saving") : t("common.save")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={closeEditor}
              className="rounded-xl px-4 py-2 text-sm font-bold text-on-surface-variant"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      ) : null}

      {!loading && items.length === 0 && editor.kind === "idle" ? (
        <p className="text-sm text-on-surface-variant">{t("settings.aiPrompts.empty")}</p>
      ) : null}

      {!loading && items.length > 0 ? (
        <ul className="divide-y divide-outline-variant/10 rounded-2xl border border-outline-variant/15">
          {items.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-on-surface">{p.title}</p>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-on-surface-variant">
                  {p.body}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => openEdit(p.id, p.title, p.body)}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
                >
                  {t("settings.aiPrompts.edit")}
                </button>
                <button
                  type="button"
                  disabled={saving}
                onClick={() => {
                  if (window.confirm(t("settings.aiPrompts.deleteConfirm"))) {
                      void (async () => {
                        await remove(p.id);
                        showToast(
                          t("settings.aiPrompts.toastDeleted"),
                          t("settings.aiPrompts.toastDeletedHint"),
                        );
                      })();
                  }
                }}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-error hover:bg-error/10 disabled:opacity-50"
                >
                  {t("common.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <WorkspaceAiPromptGenerateModal
        open={generateOpen}
        generating={generating}
        error={generateError}
        onClose={() => {
          if (!generating) setGenerateOpen(false);
        }}
        onGenerate={onGenerateFromAi}
      />
      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </>
  );
}
