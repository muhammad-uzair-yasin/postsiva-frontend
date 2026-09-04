"use client";

import { useMemo } from "react";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import { BRAND_PERSONA_PLATFORM_SLUGS } from "@/lib/social/brandPersonaTypes";
import {
  SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS,
  type SocialOAuthTokenStatusPlatform,
} from "@/lib/social/unifiedOAuthApi";

function isOAuthPlatform(slug: string): slug is SocialOAuthTokenStatusPlatform {
  return (SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS as readonly string[]).includes(slug);
}

export function useConnectedBrandPersonaPlatforms(): {
  platforms: readonly string[];
  loading: boolean;
} {
  const { oauthTokenStatus, isLoadingOAuthStatus } = useWorkspaceHeaderAccounts();

  const platforms = useMemo(() => {
    if (!oauthTokenStatus) {
      return [];
    }
    return BRAND_PERSONA_PLATFORM_SLUGS.filter(
      (slug) => isOAuthPlatform(slug) && oauthTokenStatus[slug] === true,
    );
  }, [oauthTokenStatus]);

  return { platforms, loading: isLoadingOAuthStatus };
}
