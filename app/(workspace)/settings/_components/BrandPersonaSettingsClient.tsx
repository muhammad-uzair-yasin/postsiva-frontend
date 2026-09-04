"use client";

import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";

import { DraftEditorActionConfirmModal } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorActionConfirmModal";
import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useConnectedBrandPersonaPlatforms } from "../_hooks/useConnectedBrandPersonaPlatforms";
import { useWorkspaceBrandPersona } from "../_hooks/useWorkspaceBrandPersona";
import { PersonaFieldsForm } from "./PersonaFieldsForm";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

export function BrandPersonaSettingsClient(): ReactElement {
  const { t } = useTranslations();
  const {
    data,
    loading,
    saving,
    error,
    setMode,
    setGlobalField,
    setPlatformField,
    save,
    clear,
    refresh,
  } = useWorkspaceBrandPersona();
  const { platforms: connectedPlatforms, loading: loadingConnections } =
    useConnectedBrandPersonaPlatforms();
  const [activePlatform, setActivePlatform] = useState<string>("linkedin");
  const [confirmClear, setConfirmClear] = useState(false);
  const { toast, toastKey, dismissToast, showToast } = useDraftActionSuccessToast();

  useEffect(() => {
    if (connectedPlatforms.length === 0) {
      return;
    }
    if (!connectedPlatforms.includes(activePlatform)) {
      setActivePlatform(connectedPlatforms[0]!);
    }
  }, [activePlatform, connectedPlatforms]);

  const handleSave = () => {
    void (async () => {
      try {
        await save();
        showToast(t("settings.personaSaved"), t("settings.personaSavedHint"));
      } catch {
        /* error surfaced via hook */
      }
    })();
  };

  const handleClear = () => {
    void (async () => {
      try {
        await clear();
        showToast(t("settings.personaCleared"), t("settings.personaClearedHint"));
      } catch {
        /* error surfaced via hook */
      }
    })();
  };

  return (
    <SettingsSectionPanel beta title={t("settings.personaTitle")}>
      <DraftEditorSuccessToast
        key={toastKey}
        title={toast?.title ?? ""}
        subtitle={toast?.subtitle ?? ""}
        onDismiss={dismissToast}
      />

      <p className="text-sm leading-relaxed text-on-surface-variant">
        {t("settings.personaIntro")}
      </p>

      {loading ? <p className="text-sm text-on-surface-variant">{t("common.loading")}</p> : null}

      {error ? (
        <div className="flex flex-col gap-3">
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

      {!loading && !error ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {(["same_for_all", "per_platform"] as const).map((m) => (
              <button
                key={m}
                type="button"
                disabled={saving}
                onClick={() => setMode(m)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  data.mode === m
                    ? "bg-primary text-on-primary shadow"
                    : "border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {m === "same_for_all"
                  ? t("settings.personaModeSame")
                  : t("settings.personaModePerPlatform")}
              </button>
            ))}
          </div>

          {data.mode === "same_for_all" ? (
            <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
              <h3 className="mb-4 text-sm font-bold text-on-surface">
                {t("settings.personaGlobalTitle")}
              </h3>
              <PersonaFieldsForm
                values={data.global_persona}
                onChange={setGlobalField}
                disabled={saving}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
                <h3 className="mb-1 text-sm font-bold text-on-surface">
                  {t("settings.personaGlobalFallbackTitle")}
                </h3>
                <p className="mb-4 text-xs text-on-surface-variant">
                  {t("settings.personaGlobalFallbackHint")}
                </p>
                <PersonaFieldsForm
                  values={data.global_persona}
                  onChange={setGlobalField}
                  disabled={saving}
                />
              </div>
              <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
                {loadingConnections ? (
                  <p className="text-sm text-on-surface-variant">
                    {t("settings.personaLoadingPlatforms")}
                  </p>
                ) : connectedPlatforms.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    {t("settings.personaNoPlatforms")}{" "}
                    <Link
                      href="/settings/connections"
                      className="font-bold text-secondary hover:underline"
                    >
                      {t("settings.personaConnectAccounts")}
                    </Link>{" "}
                    {t("settings.personaPerPlatformHint")}
                  </p>
                ) : (
                  <>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {connectedPlatforms.map((slug) => (
                        <button
                          key={slug}
                          type="button"
                          disabled={saving}
                          onClick={() => setActivePlatform(slug)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${
                            activePlatform === slug
                              ? "bg-secondary/20 text-secondary"
                              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {slug}
                        </button>
                      ))}
                    </div>
                    <PersonaFieldsForm
                      values={
                        data.platform_personas[activePlatform] ?? {
                          tone: "",
                          brand_description: "",
                          target_audience: "",
                          avoid: "",
                        }
                      }
                      onChange={(key, value) => setPlatformField(activePlatform, key, value)}
                      disabled={saving}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-xl bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container disabled:opacity-50"
            >
              {saving ? t("common.saving") : t("settings.personaSave")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirmClear(true)}
              className="rounded-xl border border-outline-variant/20 px-6 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
            >
              {t("settings.personaClear")}
            </button>
          </div>
        </div>
      ) : null}

      <DraftEditorActionConfirmModal
        open={confirmClear}
        title={t("settings.personaClearTitle")}
        description={t("settings.personaClearBody")}
        confirmLabel={t("common.clear")}
        isDanger
        isBusy={saving}
        onConfirm={() => {
          setConfirmClear(false);
          handleClear();
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </SettingsSectionPanel>
  );
}
