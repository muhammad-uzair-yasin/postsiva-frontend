"use client";

import type { Ref } from "react";

export type WorkspaceNoticeTone = "primary" | "warning";

const TONE_STYLES: Record<
  WorkspaceNoticeTone,
  {
    shell: string;
    iconWrap: string;
    icon: string;
    cta: string;
  }
> = {
  primary: {
    shell:
      "border-primary/30 bg-gradient-to-r from-primary-container/20 via-primary/10 to-secondary/10 shadow-primary/10",
    iconWrap: "bg-primary/15 ring-primary/25",
    icon: "text-primary",
    cta: "bg-primary text-on-primary shadow-primary/25 hover:brightness-110",
  },
  warning: {
    shell:
      "border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/10 shadow-amber-500/10",
    iconWrap: "bg-amber-400/15 ring-amber-400/25",
    icon: "text-amber-300",
    cta: "bg-amber-400 text-black shadow-amber-400/20 hover:brightness-105",
  },
};

type WorkspaceNoticeBannerProps = {
  readonly tone: WorkspaceNoticeTone;
  readonly icon: string;
  readonly body: string;
  readonly detail?: string;
  readonly cta: string;
  readonly onAction: () => void;
  readonly actionRef?: Ref<HTMLButtonElement>;
};

export function WorkspaceNoticeBanner({
  tone,
  icon,
  body,
  detail,
  cta,
  onAction,
  actionRef,
}: WorkspaceNoticeBannerProps): React.ReactElement {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={[
        "mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-2xl border px-4 py-3.5 shadow-lg shadow-black/15 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5",
        styles.shell,
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <span
          className={[
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
            styles.iconWrap,
          ].join(" ")}
          aria-hidden
        >
          <span className={["material-symbols-outlined text-[22px]", styles.icon].join(" ")}>
            {icon}
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-on-surface sm:text-[15px]">{body}</p>
          {detail ? (
            <p className="mt-1 text-xs font-medium leading-4 text-on-surface-variant sm:text-sm">
              {detail}
            </p>
          ) : null}
        </div>
      </div>
      <button
        ref={actionRef}
        type="button"
        onClick={onAction}
        className={[
          "inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold shadow-md transition active:scale-[0.98]",
          styles.cta,
        ].join(" ")}
      >
        {cta}
      </button>
    </div>
  );
}
