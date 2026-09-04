"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  getStoredActiveWorkspaceId,
  getStoredWorkspaces,
  POSTSIVA_ACTIVE_WORKSPACE_CHANGED,
  POSTSIVA_WORKSPACES_CHANGED,
} from "@/lib/auth/session";

import { applyDocumentLocale } from "./applyDocumentLocale";
import { enMessages, getMessages } from "./catalog";
import {
  DEFAULT_WORKSPACE_LOCALE,
  normalizeWorkspaceLocale,
  type WorkspaceLocale,
} from "./locales";
import type { Messages } from "./messageTypes";
import { translate, type TranslationVars } from "./translate";

type WorkspaceLocaleContextValue = {
  locale: WorkspaceLocale;
  messages: Messages;
  t: (key: string, vars?: TranslationVars) => string;
};

const WorkspaceLocaleContext = createContext<WorkspaceLocaleContextValue | null>(null);

function readActiveWorkspaceLocale(): WorkspaceLocale {
  const workspaceId = getStoredActiveWorkspaceId();
  if (!workspaceId) {
    return DEFAULT_WORKSPACE_LOCALE;
  }
  const ws = getStoredWorkspaces().find((w) => w.id === workspaceId);
  return normalizeWorkspaceLocale(ws?.locale);
}

function subscribeLocaleStore(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const handler = (): void => onStoreChange();
  window.addEventListener(POSTSIVA_ACTIVE_WORKSPACE_CHANGED, handler);
  window.addEventListener(POSTSIVA_WORKSPACES_CHANGED, handler);
  return () => {
    window.removeEventListener(POSTSIVA_ACTIVE_WORKSPACE_CHANGED, handler);
    window.removeEventListener(POSTSIVA_WORKSPACES_CHANGED, handler);
  };
}

export function WorkspaceLocaleProvider({ children }: { children: ReactNode }): React.ReactElement {
  const locale = useSyncExternalStore(
    subscribeLocaleStore,
    readActiveWorkspaceLocale,
    () => DEFAULT_WORKSPACE_LOCALE,
  );

  const messages = useMemo(() => getMessages(locale), [locale]);

  const t = useCallback(
    (key: string, vars?: TranslationVars) => translate(messages, enMessages, key, vars),
    [messages],
  );

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const value = useMemo(
    () => ({ locale, messages, t }),
    [locale, messages, t],
  );

  return (
    <WorkspaceLocaleContext.Provider value={value}>
      {children}
    </WorkspaceLocaleContext.Provider>
  );
}

export function useWorkspaceLocale(): WorkspaceLocale {
  const ctx = useContext(WorkspaceLocaleContext);
  return ctx?.locale ?? DEFAULT_WORKSPACE_LOCALE;
}

export function useTranslations(): WorkspaceLocaleContextValue {
  const ctx = useContext(WorkspaceLocaleContext);
  if (!ctx) {
    const messages = enMessages;
    return {
      locale: DEFAULT_WORKSPACE_LOCALE,
      messages,
      t: (key: string, vars?: TranslationVars) =>
        translate(messages, enMessages, key, vars),
    };
  }
  return ctx;
}
