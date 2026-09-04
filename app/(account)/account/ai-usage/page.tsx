"use client";

import type { ReactElement } from "react";

import { AiUsageDashboardClient } from "@/app/(workspace)/settings/_components/AiUsageDashboardClient";

import { useAccountWorkspaceId } from "../_hooks/useAccountWorkspaceId";

export default function AccountAiUsagePage(): ReactElement {
  const workspaceId = useAccountWorkspaceId();
  return <AiUsageDashboardClient workspaceIdOverride={workspaceId} />;
}
