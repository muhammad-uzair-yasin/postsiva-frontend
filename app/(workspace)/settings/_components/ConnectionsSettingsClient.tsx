"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { AdPlatformsModal } from "../../ad-platform/_components/AdPlatformsModal";

import { SettingsSectionPanel } from "./SettingsSectionPanel";

export function ConnectionsSettingsClient(): ReactElement {
  const { t } = useTranslations();

  // Cloud Storage connections now render inside AdPlatformsModal (embedded here),
  // so the connect UI stays consistent between the channels modal and settings.
  return (
    <SettingsSectionPanel title={t("settings.connectionsTitle")}>
      <AdPlatformsModal variant="embedded" onClose={() => {}} />
    </SettingsSectionPanel>
  );
}
