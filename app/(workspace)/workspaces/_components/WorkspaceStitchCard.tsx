"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { setActiveWorkspaceId } from "@/lib/auth/session";
import { consumePostAuthNextPath } from "@/lib/auth/getPostAuthPath";

import type { WorkspaceStitchCardSeed } from "../_types/workspaceSelectionSeed";

import { WorkspaceChannelChips } from "./WorkspaceChannelChips";

interface WorkspaceStitchCardProps {
  seed: WorkspaceStitchCardSeed;
}

export function WorkspaceStitchCard({
  seed,
}: WorkspaceStitchCardProps): React.ReactElement {
  const router = useRouter();
  const { t } = useTranslations();
  const memberCount =
    seed.memberCount !== undefined
      ? Math.max(0, Math.floor(Number(seed.memberCount)) || 0)
      : null;
  const totalChannels = seed.totalChannelCount ?? seed.channels.length;

  return (
    <article className="group flex h-full min-h-[280px] flex-col rounded-2xl border border-outline-variant/12 bg-surface-container/60 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_12px_40px_rgba(107,73,216,0.12)] sm:p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-container to-[#4c23b9] text-xl font-bold text-on-primary-container shadow-md ring-2 ring-primary-container/15">
          {seed.imageUrl ? (
            <img
              alt=""
              src={seed.imageUrl}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="relative z-[1]">{seed.initialLetter}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="truncate text-lg font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary">
            {seed.title}
          </h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            {memberCount !== null
              ? `${memberCount} ${memberCount === 1 ? t("workspaces.cardMember") : t("workspaces.cardMembers")}`
              : t("workspaces.cardWorkspaceFallback")}
          </p>
        </div>
        <Link
          href={`/workspaces/edit?id=${encodeURIComponent(seed.id)}`}
          onClick={() => setActiveWorkspaceId(seed.id)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          aria-label={t("workspaces.cardSettingsAria", { name: seed.title })}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </Link>
      </div>

      <div className="mb-5 flex-1">
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-outline">
          {t("workspaces.cardChannelsLabel")}
        </p>
        <WorkspaceChannelChips
          channels={seed.channels}
          totalCount={totalChannels}
        />
      </div>

      <Link
        href="/dashboard"
        onClick={(event) => {
          event.preventDefault();
          setActiveWorkspaceId(seed.id);
          router.push(consumePostAuthNextPath() ?? "/dashboard");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-3.5 text-sm font-bold tracking-wide text-on-primary-container shadow-lg shadow-primary-container/15 transition-all hover:bg-[#7b5be0] active:scale-[0.98]"
      >
        {t("workspaces.cardOpenWorkspace")}
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </Link>
    </article>
  );
}
