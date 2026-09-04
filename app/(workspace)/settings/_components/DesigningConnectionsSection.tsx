"use client";

import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { AdPlatformDisconnectConfirmModal } from "../../ad-platform/_components/AdPlatformDisconnectConfirmModal";
import { useCanvaConnection } from "../_hooks/useCanvaConnection";
import { CanvaConnectionCard } from "./CanvaConnectionCard";

export function DesigningConnectionsSection(): ReactElement {
  const { t } = useTranslations();
  const canva = useCanvaConnection();
  const [pendingDisconnect, setPendingDisconnect] = useState(false);

  return (
    <section aria-labelledby="designing-heading" className="mt-8 w-full">
      <div className="mb-3">
        <h3 id="designing-heading" className="text-base font-bold text-on-surface">
          {t("designing.sectionTitle")}
        </h3>
        <p className="mt-0.5 text-xs text-on-surface-variant sm:text-sm">
          {t("designing.sectionSubtitle")}
        </p>
      </div>
      {canva.error ? (
        <p
          className="mb-3 rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-xs font-semibold text-error"
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
