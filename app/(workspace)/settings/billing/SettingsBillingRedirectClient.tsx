"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, type ReactElement } from "react";

import { useWorkspaceAccountSettings } from "@/app/(workspace)/_components/shell/WorkspaceAccountSettingsProvider";

/** Legacy /settings/billing URLs open the billing modal and return to the app shell. */
export function SettingsBillingRedirectClient(): ReactElement | null {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openBillingSettings } = useWorkspaceAccountSettings();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const upgrade = searchParams.get("upgrade");
    openBillingSettings(upgrade ? { billingUpgradePlan: upgrade } : undefined);

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/dashboard");
  }, [openBillingSettings, router, searchParams]);

  return null;
}
