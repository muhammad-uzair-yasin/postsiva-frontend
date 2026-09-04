"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import { useWorkspaceAccountSettings } from "@/app/(workspace)/_components/shell/WorkspaceAccountSettingsProvider";
import { useBilling } from "@/lib/billing/BillingContext";
import {
  isBillingNavLocked,
  MESSAGING_HREF_FEATURES,
  settingsRouteFeature,
} from "@/lib/billing/featureGates";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  SETTINGS_AUTOMATION_INTEGRATIONS,
  SETTINGS_MESSAGING_INTEGRATIONS,
} from "@/lib/settings/integrationsData";

import { SettingsSectionPanel } from "./SettingsSectionPanel";

const integrationRowClassName =
  "flex w-full items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container-low px-4 py-3.5 transition hover:border-primary/20";

function IntegrationRow(props: {
  href: string;
  name: string;
  description: string;
  locked: boolean;
  lockedTitle: string;
  proLabel: string;
}): ReactElement {
  const { href, name, description, locked, lockedTitle, proLabel } = props;
  const { openBillingSettings } = useWorkspaceAccountSettings();

  if (locked) {
    return (
      <button
        type="button"
        onClick={() => openBillingSettings()}
        className={`${integrationRowClassName} cursor-not-allowed opacity-50 hover:border-outline-variant/15`}
        title={lockedTitle}
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="block text-sm font-bold text-on-surface">{name}</span>
            <span className="material-symbols-outlined text-base text-on-surface-variant">
              lock
            </span>
          </span>
          <span className="mt-0.5 block text-xs text-on-surface-variant">{description}</span>
        </span>
        <span className="ml-3 shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
          {proLabel}
        </span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={integrationRowClassName}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="block text-sm font-bold text-on-surface">{name}</span>
        </span>
        <span className="mt-0.5 block text-xs text-on-surface-variant">{description}</span>
      </span>
      <span className="shrink-0 text-on-surface-variant">›</span>
    </Link>
  );
}

export function IntegrationsListClient(): ReactElement {
  const { t } = useTranslations();
  const { usage, loading } = useBilling();
  const features = usage?.features;

  return (
    <SettingsSectionPanel title={t("settings.integrationsTitle")}>
      <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
        {t("settings.integrationsIntro")} {t("settings.integrationsIntroLocked")}
      </p>

      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        {t("shell.integrationsWorkspaceSection")}
      </h2>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant/80">
        {t("settings.integrationsMessaging")}
      </h3>
      <ul className="mb-8 flex flex-col gap-2">
        {SETTINGS_MESSAGING_INTEGRATIONS.map((m) => {
          const flag = MESSAGING_HREF_FEATURES[m.href] ?? null;
          const locked = isBillingNavLocked(flag, features, loading);
          return (
            <li key={m.href}>
              <IntegrationRow
                href={m.href}
                name={m.name}
                description={m.description}
                locked={locked}
                lockedTitle={t("settings.integrationsUpgradeUnlock")}
                proLabel={t("settings.integrationsPro")}
              />
            </li>
          );
        })}
      </ul>

      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant/80">
        {t("settings.integrationsAutomationAi")}
      </h3>
      <ul className="flex flex-col gap-2">
        {SETTINGS_AUTOMATION_INTEGRATIONS.map((item) => {
          const flag = settingsRouteFeature(item.href);
          const locked = isBillingNavLocked(flag, features, loading);
          return (
            <li key={item.href}>
              <IntegrationRow
                href={item.href}
                name={item.name}
                description={item.description}
                locked={locked}
                lockedTitle={t("settings.integrationsUpgradeUnlock")}
                proLabel={t("settings.integrationsPro")}
              />
            </li>
          );
        })}
      </ul>

    </SettingsSectionPanel>
  );
}
