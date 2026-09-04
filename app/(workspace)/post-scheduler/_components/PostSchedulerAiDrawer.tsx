"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export type PostSchedulerAiDrawerVariant = "viewport" | "modalPanel";

const MODAL_PANEL_INNER_W_CLASS = "w-[min(22rem,88vw)]";

const PostSchedulerAiDrawerPanelContent = dynamic(
  () =>
    import("./PostSchedulerAiDrawerPanelContent").then((m) => ({
      default: m.PostSchedulerAiDrawerPanelContent,
    })),
  { ssr: false },
);

interface PostSchedulerAiDrawerProps {
  open: boolean;
  onClose: () => void;
  variant?: PostSchedulerAiDrawerVariant;
}

export function PostSchedulerAiDrawer({
  open,
  onClose,
  variant = "viewport",
}: PostSchedulerAiDrawerProps): React.ReactElement {
  const { t } = useTranslations();

  if (variant === "modalPanel") {
    return (
      <aside
        id="post-scheduler-ai-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("postScheduler.aiToolkit.drawerAria")}
        aria-hidden={!open}
        className={`relative z-20 flex h-full min-h-0 min-w-0 shrink-0 flex-col overflow-hidden bg-surface shadow-[-12px_0_40px_rgba(0,0,0,0.45)] transition-[width,opacity,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
          open
            ? `border-l border-outline-variant/15 ${MODAL_PANEL_INNER_W_CLASS} opacity-100`
            : "pointer-events-none w-0 border-0 border-transparent opacity-0 shadow-none"
        }`}
      >
        <div
          className={`workspace-modal-scrollbar flex h-full min-h-0 min-w-0 w-full flex-col overflow-y-auto px-3 py-4 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none sm:px-4 sm:py-5 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {open ? <PostSchedulerAiDrawerPanelContent onClose={onClose} /> : null}
        </div>
      </aside>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        id="post-scheduler-ai-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("postScheduler.aiToolkit.drawerAria")}
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-[70] flex h-full min-h-0 w-full max-w-[min(100vw,22rem)] flex-col border-l border-outline-variant/15 bg-surface px-4 py-6 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none will-change-transform sm:max-w-[22rem] sm:py-8 ${
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0"
        }`}
      >
        {open ? <PostSchedulerAiDrawerPanelContent onClose={onClose} /> : null}
      </aside>
    </>
  );
}
