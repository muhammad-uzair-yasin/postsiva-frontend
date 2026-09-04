"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  WorkspaceAccountSettingsModal,
  type WorkspaceAccountSettingsHref,
} from "./WorkspaceAccountSettingsModal";

type AccountSettingsState = {
  readonly href: WorkspaceAccountSettingsHref;
  readonly labelKey: string;
  readonly billingUpgradePlan: string | null;
};

type WorkspaceAccountSettingsContextValue = {
  readonly openAccountSettings: (
    href: WorkspaceAccountSettingsHref,
    labelKey: string,
    options?: { readonly billingUpgradePlan?: string | null },
  ) => void;
  readonly openBillingSettings: (options?: {
    readonly billingUpgradePlan?: string | null;
  }) => void;
  readonly closeAccountSettings: () => void;
};

const WorkspaceAccountSettingsContext =
  createContext<WorkspaceAccountSettingsContextValue | null>(null);

export function WorkspaceAccountSettingsProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [state, setState] = useState<AccountSettingsState | null>(null);

  const closeAccountSettings = useCallback((): void => {
    setState(null);
  }, []);

  const openAccountSettings = useCallback(
    (
      href: WorkspaceAccountSettingsHref,
      labelKey: string,
      options?: { billingUpgradePlan?: string | null },
    ): void => {
      setState({
        href,
        labelKey,
        billingUpgradePlan: options?.billingUpgradePlan ?? null,
      });
    },
    [],
  );

  const openBillingSettings = useCallback(
    (options?: { billingUpgradePlan?: string | null }): void => {
      openAccountSettings("/account/billing", "billing.title", options);
    },
    [openAccountSettings],
  );

  const value = useMemo(
    () => ({ openAccountSettings, openBillingSettings, closeAccountSettings }),
    [openAccountSettings, openBillingSettings, closeAccountSettings],
  );

  return (
    <WorkspaceAccountSettingsContext.Provider value={value}>
      {children}
      <WorkspaceAccountSettingsModal
        open={state !== null}
        href={state?.href ?? null}
        titleKey={state?.labelKey ?? "settings.profile"}
        billingUpgradePlan={state?.billingUpgradePlan ?? null}
        onClose={closeAccountSettings}
      />
    </WorkspaceAccountSettingsContext.Provider>
  );
}

export function useWorkspaceAccountSettings(): WorkspaceAccountSettingsContextValue {
  const ctx = useContext(WorkspaceAccountSettingsContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceAccountSettings must be used within WorkspaceAccountSettingsProvider",
    );
  }
  return ctx;
}
