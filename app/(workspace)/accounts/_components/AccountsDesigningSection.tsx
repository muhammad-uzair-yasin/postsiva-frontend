"use client";

import { useState, type ReactElement } from "react";

import { CANVA_ICON_SRC } from "@/lib/social/designProviderIconSrc";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { AdPlatformDisconnectConfirmModal } from "../../ad-platform/_components/AdPlatformDisconnectConfirmModal";
import { CanvaConnectionCard } from "../../settings/_components/CanvaConnectionCard";
import { useCanvaConnection } from "../../settings/_hooks/useCanvaConnection";

export function AccountsDesigningSection(): ReactElement {
  const { t } = useTranslations();
  const canva = useCanvaConnection();
  const [pendingDisconnect, setPendingDisconnect] = useState(false);

  return (
    <section aria-labelledby="accounts-designing-heading" className="flex flex-col gap-2">
      <div className="mt-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
        <img src={CANVA_ICON_SRC} alt="" className="h-5 w-5 object-contain" loading="lazy" decoding="async" />
        <h2 id="accounts-designing-heading" className="text-xs font-bold uppercase text-on-surface-variant">
          {t("designing.sectionTitle")}
        </h2>
        <span className="text-xs text-on-surface-variant/70">1</span>
      </div>
      {canva.error ? (
        <p
          className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {canva.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <CanvaConnectionCard
          connected={canva.connected}
          accountLabel={canva.accountLabel}
          isLoading={canva.loading}
          connectPending={canva.connecting}
          disconnectPending={canva.disconnecting}
          onConnect={() => {
            void canva.connect();
          }}
          onDisconnect={() => {
            setPendingDisconnect(true);
          }}
        />
      </div>
      <AdPlatformDisconnectConfirmModal
        open={pendingDisconnect}
        platformName={t("designing.canvaName")}
        busy={canva.disconnecting}
        error={null}
        onClose={() => {
          if (!canva.disconnecting) {
            setPendingDisconnect(false);
          }
        }}
        onConfirm={async () => {
          await canva.disconnect();
          setPendingDisconnect(false);
        }}
      />
    </section>
  );
}
