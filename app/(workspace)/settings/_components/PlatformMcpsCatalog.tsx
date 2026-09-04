"use client";

import Image from "next/image";
import { useMemo, type ReactElement } from "react";

import {
  PLATFORM_MCPS,
  UNIFIED_MCP_DESCRIPTION,
  UNIFIED_MCP_NAME,
  getPlatformMcpDescription,
  getPlatformMcpLabel,
  getPlatformMcpName,
  getPlatformMcpUrl,
  getUnifiedLocalMcpUrl,
  getUnifiedWebMcpUrl,
  platformMcpConfigJson,
  type PlatformMcpId,
} from "@/lib/mcp/platformMcps";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  SOCIAL_PLATFORM_ICON_SRC,
  type SocialPlatformIconId,
} from "@/lib/social/socialPlatformIconSrc";

import { McpCopyableField } from "./McpCopyableField";

type PlatformMcpsCatalogProps = {
  mcpBaseUrl: string;
  apiKey?: string;
  copiedKey: string;
  copyBusy?: boolean;
  displayUrl: (baseUrl: string) => string;
  onCopyUrlWithKey: (baseUrl: string, copyId: string) => void;
  onCopyPlain: (value: string, copyId: string) => void;
};

function McpActionButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors disabled:opacity-50 ${
        active
          ? "bg-secondary/20 text-secondary"
          : "bg-surface-container-highest text-primary hover:bg-primary/10"
      }`}
    >
      <span className="material-symbols-outlined text-sm">
        {active ? "check" : "content_copy"}
      </span>
      {label}
    </button>
  );
}

function UnifiedMcpCard({
  id,
  clientHint,
  icon,
  displayUrl,
  baseUrl,
  copiedKey,
  copyBusy,
  onCopyUrlWithKey,
  onCopyPlain,
  copyUrlLabel,
  copiedLabel,
  nameLabel,
  descriptionLabel,
}: {
  id: string;
  clientHint: string;
  icon: ReactElement;
  displayUrl: string;
  baseUrl: string;
  copiedKey: string;
  copyBusy?: boolean;
  onCopyUrlWithKey: (baseUrl: string, copyId: string) => void;
  onCopyPlain: (value: string, copyId: string) => void;
  copyUrlLabel: string;
  copiedLabel: string;
  nameLabel: string;
  descriptionLabel: string;
}): ReactElement {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5 shadow-sm">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-on-surface">{UNIFIED_MCP_NAME}</h3>
          <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">{clientHint}</p>
        </div>
      </div>
      <McpCopyableField
        label={nameLabel}
        value={UNIFIED_MCP_NAME}
        copyId={`${id}-name`}
        copiedKey={copiedKey}
        copiedLabel={copiedLabel}
        copyBusy={copyBusy}
        onCopy={onCopyPlain}
      />
      <McpCopyableField
        label={descriptionLabel}
        value={UNIFIED_MCP_DESCRIPTION}
        copyId={`${id}-desc`}
        copiedKey={copiedKey}
        copiedLabel={copiedLabel}
        copyBusy={copyBusy}
        multiline
        onCopy={onCopyPlain}
      />
      <div className="relative mt-3 rounded-xl border border-outline-variant/10 bg-surface-container-high/80 px-3 py-2.5">
        <code className="block break-all font-mono text-[11px] leading-5 text-secondary">
          {displayUrl}
        </code>
      </div>
      <div className="relative mt-3 flex flex-wrap gap-2">
        <McpActionButton
          label={copiedKey === `${id}-url` ? copiedLabel : copyUrlLabel}
          active={copiedKey === `${id}-url`}
          disabled={copyBusy}
          onClick={() => onCopyUrlWithKey(baseUrl, `${id}-url`)}
        />
      </div>
    </article>
  );
}

function PlatformMcpCard({
  platformId,
  displayUrl,
  baseUrl,
  copiedKey,
  copyBusy,
  onCopyUrlWithKey,
  onCopyPlain,
  configJson,
  copiedLabel,
  nameLabel,
  descriptionLabel,
}: {
  platformId: PlatformMcpId;
  displayUrl: string;
  baseUrl: string;
  copiedKey: string;
  copyBusy?: boolean;
  onCopyUrlWithKey: (baseUrl: string, copyId: string) => void;
  onCopyPlain: (value: string, copyId: string) => void;
  configJson: string;
  copiedLabel: string;
  nameLabel: string;
  descriptionLabel: string;
}): ReactElement {
  const iconSrc = SOCIAL_PLATFORM_ICON_SRC[platformId as SocialPlatformIconId];
  const mcpName = getPlatformMcpName(platformId);
  const mcpDescription = getPlatformMcpDescription(platformId);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-outline-variant/12 bg-surface-container-low p-4 transition-colors hover:border-primary/25 hover:bg-surface-container-high/40">
      <div className="flex items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-surface-container-highest ring-1 ring-outline-variant/10">
          <Image src={iconSrc} alt="" fill className="object-contain p-1.5" sizes="36px" />
        </div>
        <h3 className="text-sm font-bold text-on-surface">{getPlatformMcpLabel(platformId)}</h3>
      </div>
      <McpCopyableField
        label={nameLabel}
        value={mcpName}
        copyId={`${platformId}-name`}
        copiedKey={copiedKey}
        copiedLabel={copiedLabel}
        copyBusy={copyBusy}
        onCopy={onCopyPlain}
      />
      <McpCopyableField
        label={descriptionLabel}
        value={mcpDescription}
        copyId={`${platformId}-desc`}
        copiedKey={copiedKey}
        copiedLabel={copiedLabel}
        copyBusy={copyBusy}
        multiline
        onCopy={onCopyPlain}
      />
      <div className="mt-3 flex-1 rounded-lg border border-outline-variant/10 bg-surface-container-high/60 px-2.5 py-2">
        <code className="block break-all font-mono text-[10px] leading-4 text-on-surface-variant">
          {displayUrl}
        </code>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <McpActionButton
          label={copiedKey === `${platformId}-url` ? copiedLabel : "URL + key"}
          active={copiedKey === `${platformId}-url`}
          disabled={copyBusy}
          onClick={() => onCopyUrlWithKey(baseUrl, `${platformId}-url`)}
        />
        <McpActionButton
          label={copiedKey === `${platformId}-json` ? copiedLabel : "JSON"}
          active={copiedKey === `${platformId}-json`}
          disabled={copyBusy}
          onClick={() => onCopyPlain(configJson, `${platformId}-json`)}
        />
      </div>
    </article>
  );
}

export function PlatformMcpsCatalog({
  mcpBaseUrl,
  apiKey = "",
  copiedKey,
  copyBusy,
  displayUrl,
  onCopyUrlWithKey,
  onCopyPlain,
}: PlatformMcpsCatalogProps): ReactElement {
  const { t } = useTranslations();
  const key = apiKey.trim() || "API_KEY";
  const webBase = useMemo(() => getUnifiedWebMcpUrl(mcpBaseUrl), [mcpBaseUrl]);
  const localBase = useMemo(() => getUnifiedLocalMcpUrl(mcpBaseUrl), [mcpBaseUrl]);
  const copyUrlLabel = t("settings.mcpCopyUrlWithKey");
  const copiedLabel = t("common.copied");
  const nameLabel = t("settings.mcpNameLabel");
  const descriptionLabel = t("settings.mcpDescriptionLabel");

  return (
    <div className="mt-8 space-y-8">
      <header>
        <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">
          {t("settings.mcpPlatformMcpsTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          {t("settings.mcpPlatformMcpsHint", { count: PLATFORM_MCPS.length })}
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-secondary">hub</span>
          <h3 className="text-xs font-bold uppercase tracking-widest text-secondary">
            {t("settings.mcpPlatformMcpsUnifiedHeading")}
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <UnifiedMcpCard
            id="unified-web"
            clientHint={t("settings.mcpWebHint")}
            icon={
              <span className="material-symbols-outlined text-xl text-primary">language</span>
            }
            baseUrl={webBase}
            displayUrl={displayUrl(webBase)}
            copiedKey={copiedKey}
            copyBusy={copyBusy}
            onCopyUrlWithKey={onCopyUrlWithKey}
            onCopyPlain={onCopyPlain}
            copyUrlLabel={copyUrlLabel}
            copiedLabel={copiedLabel}
            nameLabel={nameLabel}
            descriptionLabel={descriptionLabel}
          />
          <UnifiedMcpCard
            id="unified-local"
            clientHint={t("settings.mcpLocalHint")}
            icon={
              <span className="material-symbols-outlined text-xl text-primary">terminal</span>
            }
            baseUrl={localBase}
            displayUrl={displayUrl(localBase)}
            copiedKey={copiedKey}
            copyBusy={copyBusy}
            onCopyUrlWithKey={onCopyUrlWithKey}
            onCopyPlain={onCopyPlain}
            copyUrlLabel={copyUrlLabel}
            copiedLabel={copiedLabel}
            nameLabel={nameLabel}
            descriptionLabel={descriptionLabel}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-secondary">grid_view</span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-secondary">
              {t("settings.mcpPlatformMcpsPerPlatformHeading")}
            </h3>
          </div>
          <span className="rounded-full bg-surface-container-highest px-2.5 py-1 text-[10px] font-bold text-on-surface-variant">
            {PLATFORM_MCPS.length} servers
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PLATFORM_MCPS.map((platformId) => {
            const baseUrl = getPlatformMcpUrl(mcpBaseUrl, platformId);
            return (
              <PlatformMcpCard
                key={platformId}
                platformId={platformId}
                baseUrl={baseUrl}
                displayUrl={displayUrl(baseUrl)}
                copiedKey={copiedKey}
                copyBusy={copyBusy}
                onCopyUrlWithKey={onCopyUrlWithKey}
                onCopyPlain={onCopyPlain}
                configJson={platformMcpConfigJson(mcpBaseUrl, platformId, key)}
                copiedLabel={copiedLabel}
                nameLabel={nameLabel}
                descriptionLabel={descriptionLabel}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
