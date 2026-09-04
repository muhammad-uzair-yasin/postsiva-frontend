"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { SettingsSectionPanel } from "./SettingsSectionPanel";
import { WorkspaceAiOutputLanguageSection } from "./WorkspaceAiOutputLanguageSection";
import { WorkspaceAiPromptsSettingsBody } from "./WorkspaceAiPromptsSettingsClient";

export function WorkspaceAiSettingsClient(): ReactElement {
  const { t } = useTranslations();

  return (
    <SettingsSectionPanel beta title={t("settings.aiSettings.title")}>
      <p className="text-sm text-on-surface-variant">{t("settings.aiSettings.intro")}</p>

      <WorkspaceAiOutputLanguageSection />

      <div className="space-y-6 border-t border-outline-variant/15 pt-10">
        <div>
          <h3 className="text-xl font-bold text-on-surface">{t("settings.aiPrompts.title")}</h3>
          <p className="mt-1 text-sm text-on-surface-variant">{t("settings.aiPrompts.intro")}</p>
        </div>
        <WorkspaceAiPromptsSettingsBody />
      </div>
    </SettingsSectionPanel>
  );
}
