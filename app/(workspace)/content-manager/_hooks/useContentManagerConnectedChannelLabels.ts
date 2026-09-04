"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoredAccessToken } from "@/lib/auth/session";
import { SOCIAL_OAUTH_STATUS_UPDATED_EVENT, type SocialOAuthStatusUpdatedDetail } from "@/lib/social/unifiedOAuthApi";
import { UNIFIED_PROFILES_MERGED_EVENT, type UnifiedProfilesMergedDetail } from "@/lib/dashboard/unifiedProfilesPartialMerge";
import type { ContentManagerChannelFilter } from "../_types/contentManagerTypes";
import {
  getConnectedContentManagerChannelLabelsFromCachesOnly,
  type ConnectedContentManagerChannelLabels,
} from "@/lib/contentManager/fetchConnectedContentManagerChannelLabels";
import { useActiveWorkspaceId } from "@/app/(workspace)/_hooks/useActiveWorkspaceId";

type LabelsByFilter = Partial<Record<ContentManagerChannelFilter, string>>;

export function useContentManagerConnectedChannelLabels(): {
  isLoading: boolean;
  error: string | null;
  labelsByFilter: LabelsByFilter;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labelsByFilter, setLabelsByFilter] = useState<LabelsByFilter>({});

  const workspaceId = useActiveWorkspaceId();
  const token = getStoredAccessToken();

  useEffect(() => {
    if (!workspaceId || !token) {
      setIsLoading(false);
      setError(null);
      setLabelsByFilter({});
      return;
    }

    const applyFromCaches = (): void => {
      const labels: ConnectedContentManagerChannelLabels =
        getConnectedContentManagerChannelLabelsFromCachesOnly(workspaceId);
      setLabelsByFilter(labels as LabelsByFilter);
      setError(null);
      setIsLoading(false);
    };

    applyFromCaches();

    const oauthHandler = (ev: Event): void => {
      const d = (ev as CustomEvent<SocialOAuthStatusUpdatedDetail>).detail;
      if (d && d.workspaceId === workspaceId) {
        applyFromCaches();
      }
    };
    const unifiedHandler = (ev: Event): void => {
      const d = (ev as CustomEvent<UnifiedProfilesMergedDetail>).detail;
      if (d && d.workspaceId === workspaceId) {
        applyFromCaches();
      }
    };

    window.addEventListener(SOCIAL_OAUTH_STATUS_UPDATED_EVENT, oauthHandler);
    window.addEventListener(UNIFIED_PROFILES_MERGED_EVENT, unifiedHandler);
    return () => {
      window.removeEventListener(SOCIAL_OAUTH_STATUS_UPDATED_EVENT, oauthHandler);
      window.removeEventListener(UNIFIED_PROFILES_MERGED_EVENT, unifiedHandler);
    };
  }, [workspaceId, token]);

  return useMemo(
    () => ({ isLoading, error, labelsByFilter }),
    [error, isLoading, labelsByFilter],
  );
}
