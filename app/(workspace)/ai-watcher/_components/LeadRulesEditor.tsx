"use client";

import { useEffect, useId, useState, type ReactElement } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  updateLeadRules,
  type AiAutoreplierPlatform,
} from "@/lib/social/aiAutoreplierApi";

interface LeadRulesEditorProps {
  open: boolean;
  postId: string;
  platform: string;
  channelId?: string | null;
  initialKeywords: string | null;
  initialCustomRule: string | null;
  onSaved: (keywords: string | null, customRule: string | null) => void;
  onCancel: () => void;
}

export function LeadRulesEditor({
  open,
  postId,
  platform,
  channelId,
  initialKeywords,
  initialCustomRule,
  onSaved,
  onCancel,
}: LeadRulesEditorProps): ReactElement | null {
  const { t } = useTranslations();
  const titleId = useId();
  const descId = useId();
  const [keywords, setKeywords] = useState(initialKeywords ?? "");
  const [customRule, setCustomRule] = useState(initialCustomRule ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setKeywords(initialKeywords ?? "");
    setCustomRule(initialCustomRule ?? "");
    setError(null);
  }, [open, initialKeywords, initialCustomRule, postId]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !saving) {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel, saving]);

  const handleSave = () => {
    void (async () => {
      setSaving(true);
      setError(null);
      try {
        const token = getStoredAccessToken();
        const ws = getStoredActiveWorkspaceId();
        if (!token?.trim() || !ws?.trim()) {
          throw new Error(t("aiWatcher.leadRulesErrorWorkspace"));
        }
        const result = await updateLeadRules(token, ws, {
          post_id: postId,
          platform: platform as AiAutoreplierPlatform,
          lead_keywords: keywords.trim() || null,
          lead_custom_rule: customRule.trim() || null,
          channel_id: channelId ?? null,
        });
        onSaved(result.lead_keywords, result.lead_custom_rule);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("aiWatcher.leadRulesErrorSave"));
      } finally {
        setSaving(false);
      }
    })();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("aiWatcher.leadRulesDismissAria")}
        disabled={saving}
        className="absolute inset-0 z-[120] bg-black/60"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-[121] flex w-full max-w-lg flex-col rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-extrabold text-on-surface">
              {t("aiWatcher.leadRulesModalTitle")}
            </h2>
            <p id={descId} className="mt-1 text-sm capitalize text-on-surface-variant">
              {t("aiWatcher.leadRulesPostLabel", { platform })}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
            aria-label={t("common.close")}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <p className="mt-4 text-sm text-on-surface-variant">
          {t("aiWatcher.leadRulesIntro")}
        </p>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {t("aiWatcher.leadRulesKeywordsLabel")}
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={saving}
              placeholder={t("aiWatcher.leadRulesKeywordsPlaceholder")}
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2.5 text-sm text-on-surface disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {t("aiWatcher.leadRulesCustomLabel")}
            </label>
            <textarea
              value={customRule}
              onChange={(e) => setCustomRule(e.target.value)}
              disabled={saving}
              rows={4}
              placeholder={t("aiWatcher.leadRulesCustomPlaceholder")}
              className="w-full resize-y rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2.5 text-sm text-on-surface disabled:opacity-60"
            />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-bold text-on-surface disabled:opacity-60"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-on-secondary disabled:opacity-50"
          >
            {saving ? t("common.saving") : t("aiWatcher.leadRulesSave")}
          </button>
        </div>
      </div>
    </div>
  );
}
