"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PostSchedulerAiDrawerVariant } from "./PostSchedulerAiDrawer";
import { PostSchedulerAiContext } from "./PostSchedulerAiContext";
import { PostSchedulerAiDrawer } from "./PostSchedulerAiDrawer";
import { hasComposerEscapeOverlay } from "./postSchedulerComposerEscapeOverlay";

interface PostSchedulerAiDrawerHostProps {
  children: React.ReactNode;
  /** When false, this host does not toggle document.body overflow (e.g. nested in a modal). */
  manageBodyScroll?: boolean;
  /** `modalPanel`: AI opens as a column on the right inside the parent layout (e.g. composer modal). */
  drawerVariant?: PostSchedulerAiDrawerVariant;
  /** Pinned below scroll content in `modalPanel` (e.g. Publish). */
  stickyFooter?: ReactNode;
}

export function PostSchedulerAiDrawerHost({
  children,
  manageBodyScroll = true,
  drawerVariant = "viewport",
  stickyFooter,
}: PostSchedulerAiDrawerHostProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        if (hasComposerEscapeOverlay()) {
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!manageBodyScroll) {
      return;
    }
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, manageBodyScroll]);

  const aiContext = useMemo(
    () => ({
      openAiPanel: () => {
        setOpen(true);
      },
      closeAiPanel: () => {
        setOpen(false);
      },
      toggleAiPanel: () => {
        setOpen((prev) => !prev);
      },
      aiPanelOpen: open,
    }),
    [open],
  );

  if (drawerVariant === "modalPanel") {
    return (
      <PostSchedulerAiContext.Provider value={aiContext}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
            <PostSchedulerAiDrawer
              variant="modalPanel"
              open={open}
              onClose={onClose}
            />
          </div>
          {stickyFooter ? (
            <div className="relative z-10 w-full shrink-0 border-t border-outline-variant/10 bg-surface">
              {stickyFooter}
            </div>
          ) : null}
        </div>
      </PostSchedulerAiContext.Provider>
    );
  }

  return (
    <PostSchedulerAiContext.Provider value={aiContext}>
      {children}
      <PostSchedulerAiDrawer
        variant="viewport"
        open={open}
        onClose={onClose}
      />
    </PostSchedulerAiContext.Provider>
  );
}
