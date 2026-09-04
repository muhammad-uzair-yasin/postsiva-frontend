"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { TranslationVars } from "@/lib/i18n/translate";

const CHANNEL_DISCONNECT_ITEM_KEYS = [
  "common.channelDisconnect.itemScheduled",
  "common.channelDisconnect.itemDrafts",
  "common.channelDisconnect.itemPublished",
  "common.channelDisconnect.itemComments",
  "common.channelDisconnect.itemMedia",
] as const;

interface ChannelDisconnectDataWarningProps {
  introKey: string;
  introVars?: TranslationVars;
}

export function ChannelDisconnectDataWarning({
  introKey,
  introVars,
}: ChannelDisconnectDataWarningProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-on-surface-variant">
        {t(introKey, introVars)}
      </p>
      <p className="text-sm font-semibold text-on-surface">
        {t("common.channelDisconnect.dataDeletedIntro")}
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
        {CHANNEL_DISCONNECT_ITEM_KEYS.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>
      <p className="text-sm leading-relaxed text-on-surface-variant">
        {t("common.channelDisconnect.reconnectNote")}
      </p>
    </div>
  );
}
