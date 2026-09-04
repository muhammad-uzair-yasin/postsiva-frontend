"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import { usePostHoverPreviewAutoClose } from "../../../_hooks/usePostHoverPreviewAutoClose";
import { CalendarPostHoverPreviewAttached } from "../_components/CalendarPostHoverPreviewAttached";
import type { CalendarPost } from "../_types/calendarTypes";

interface CalendarPostHoverPreviewContextValue {
  readonly onCardMouseEnter: (post: CalendarPost) => void;
  readonly onCardMouseLeave: () => void;
  readonly closePreviewNow: () => void;
}

const CalendarPostHoverPreviewContext =
  createContext<CalendarPostHoverPreviewContextValue | null>(null);

export function CalendarPostHoverPreviewProvider({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  const [post, setPost] = useState<CalendarPost | null>(null);
  const activePostIdRef = useRef<string | null>(null);
  const {
    open,
    autoCloseResetKey,
    openPreview,
    switchPreview,
    keepPreviewOpen,
    scheduleClosePreview,
    closePreviewNow: closePreviewTimer,
  } = usePostHoverPreviewAutoClose();

  const onCardMouseEnter = useCallback(
    (next: CalendarPost): void => {
      const switched =
        activePostIdRef.current != null && activePostIdRef.current !== next.id;
      activePostIdRef.current = next.id;
      setPost(next);
      if (switched) {
        switchPreview();
      } else {
        openPreview();
      }
    },
    [openPreview, switchPreview],
  );

  const closePreviewNow = useCallback((): void => {
    closePreviewTimer();
    activePostIdRef.current = null;
    setPost(null);
  }, [closePreviewTimer]);

  const onCardMouseLeave = scheduleClosePreview;

  useEffect(() => {
    if (!open) {
      activePostIdRef.current = null;
      setPost(null);
    }
  }, [open]);

  const contextValue = useMemo(
    (): CalendarPostHoverPreviewContextValue => ({
      onCardMouseEnter,
      onCardMouseLeave,
      closePreviewNow,
    }),
    [closePreviewNow, onCardMouseEnter, onCardMouseLeave],
  );

  return (
    <CalendarPostHoverPreviewContext.Provider value={contextValue}>
      {children}
      {post && open ? (
        <CalendarPostHoverPreviewAttached
          post={post}
          open={open}
          autoCloseResetKey={autoCloseResetKey}
          onClose={closePreviewNow}
          onPanelMouseEnter={keepPreviewOpen}
          onPanelMouseLeave={scheduleClosePreview}
        />
      ) : null}
    </CalendarPostHoverPreviewContext.Provider>
  );
}

type ProviderManagedHover = {
  readonly providerManaged: true;
  readonly onCardMouseEnter: () => void;
  readonly onCardMouseLeave: () => void;
  readonly closePreviewNow: () => void;
};

type LocalManagedHover = {
  readonly providerManaged: false;
  readonly onCardMouseEnter: () => void;
  readonly onCardMouseLeave: () => void;
  readonly closePreviewNow: () => void;
  readonly localPreview: ReturnType<typeof usePostHoverPreviewAutoClose>;
};

export function useCalendarPostHoverPreview(
  post: CalendarPost,
): ProviderManagedHover | LocalManagedHover {
  const ctx = useContext(CalendarPostHoverPreviewContext);
  const local = usePostHoverPreviewAutoClose();

  if (ctx) {
    return {
      providerManaged: true,
      onCardMouseEnter: () => {
        ctx.onCardMouseEnter(post);
      },
      onCardMouseLeave: ctx.onCardMouseLeave,
      closePreviewNow: ctx.closePreviewNow,
    };
  }

  return {
    providerManaged: false,
    onCardMouseEnter: local.openPreview,
    onCardMouseLeave: local.scheduleClosePreview,
    closePreviewNow: local.closePreviewNow,
    localPreview: local,
  };
}
