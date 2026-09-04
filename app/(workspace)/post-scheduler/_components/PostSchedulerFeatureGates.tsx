"use client";

import type { ReactElement, ReactNode } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function PostSchedulerPublishingGate({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { t } = useTranslations();
  return (
    <FeatureGatedPage
      feature="publish_enabled"
      featureLabel={t("postScheduler.pages.publishing")}
    >
      {children}
    </FeatureGatedPage>
  );
}

export function PostSchedulerSchedulingGate({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { t } = useTranslations();
  return (
    <FeatureGatedPage
      feature="scheduling_enabled"
      featureLabel={t("postScheduler.pages.scheduling")}
    >
      {children}
    </FeatureGatedPage>
  );
}

export function PostSchedulerAiComposerGate({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { t } = useTranslations();
  return (
    <FeatureGatedPage
      feature="ai_composer_enabled"
      featureLabel={t("postScheduler.pages.aiComposer")}
    >
      {children}
    </FeatureGatedPage>
  );
}
