"use client";

import { useState, type ReactElement } from "react";

import { DraftEditorActionConfirmModal } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorActionConfirmModal";
import { DraftEditorSuccessToast } from "../../content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "../../content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceWhatsAppPhone } from "../_hooks/useWorkspaceWhatsAppPhone";
import { SettingsIntegrationsStudioBackLink } from "./SettingsIntegrationsStudioBackLink";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

const WA_BUSINESS =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER?.trim() ?? ""
    : "";

export function WhatsappSettingsClient(): ReactElement {
  const { t } = useTranslations();
  const {
    phoneInput,
    setPhoneInput,
    loading,
    error,
    saving,
    save,
    remove,
  } = useWorkspaceWhatsAppPhone();
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  const waHref =
    WA_BUSINESS && /^\d+$/.test(WA_BUSINESS.replace(/\D/g, ""))
      ? `https://wa.me/${WA_BUSINESS.replace(/\D/g, "")}`
      : null;

  return (
    <div>
      <SettingsIntegrationsStudioBackLink />
      <SettingsSectionPanel title={t("settings.whatsappTitle")}>
      <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">
        {t("settings.whatsappIntro")}
      </p>

      {loading ? <p className="text-sm">{t("common.loading")}</p> : null}
      {error ? <p className="mb-2 text-sm text-error">{error}</p> : null}

      <label className="block">
        <span className="text-sm font-bold text-on-surface">{t("settings.whatsappPhoneLabel")}</span>
        <input
          className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          placeholder="+1…"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          className="rounded-xl bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
          onClick={() => {
            void (async () => {
              const r = await save();
              if (r.ok) {
                showToast(t("common.save"), r.message);
              }
            })();
          }}
        >
          {t("common.save")}
        </button>
        <button
          type="button"
          disabled={saving}
          className="rounded-xl border border-outline-variant/30 px-4 py-2 text-sm font-bold text-on-surface-variant"
          onClick={() => {
            setRemoveConfirmOpen(true);
          }}
        >
          {t("settings.whatsappRemove")}
        </button>
      </div>

      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block text-sm font-bold text-primary"
        >
          {t("settings.whatsappOpenBusiness")}
        </a>
      ) : null}

      <DraftEditorActionConfirmModal
        open={removeConfirmOpen}
        title={t("settings.whatsappRemoveTitle")}
        description={t("settings.whatsappRemoveBody")}
        confirmLabel={t("common.remove")}
        isDanger
        isBusy={saving}
        onConfirm={() => {
          void (async () => {
            const r = await remove();
            setRemoveConfirmOpen(false);
            if (r.ok) {
              showToast(t("common.remove"), r.message);
            }
          })();
        }}
        onCancel={() => {
          setRemoveConfirmOpen(false);
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
    </div>
  );
}
