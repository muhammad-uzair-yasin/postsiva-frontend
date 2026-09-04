"use client";

import { createContext, useContext, type ReactElement, type ReactNode } from "react";

type OnboardingConnectionGateContextValue = {
  readonly isChecking: boolean;
};

const OnboardingConnectionGateContext =
  createContext<OnboardingConnectionGateContextValue>({
    isChecking: true,
  });

export function OnboardingConnectionGateProvider({
  isChecking,
  children,
}: {
  readonly isChecking: boolean;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <OnboardingConnectionGateContext.Provider value={{ isChecking }}>
      {children}
    </OnboardingConnectionGateContext.Provider>
  );
}

export function useOnboardingConnectionGate(): OnboardingConnectionGateContextValue {
  return useContext(OnboardingConnectionGateContext);
}
