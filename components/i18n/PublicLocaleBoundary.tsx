"use client";

import { Suspense, type ReactNode } from "react";

import { AppClientEffects } from "@/components/AppClientEffects";
import { PublicLocaleProvider } from "@/lib/i18n/PublicLocaleProvider";

export function PublicLocaleBoundary({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <Suspense fallback={<div className="min-h-full">{children}</div>}>
      <PublicLocaleProvider>
        <AppClientEffects />
        {children}
      </PublicLocaleProvider>
    </Suspense>
  );
}
