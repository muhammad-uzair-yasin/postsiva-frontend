interface FirstAccountBannerState {
  readonly isWorkspaceSelection: boolean;
  readonly isLoading: boolean;
  readonly profilesError: string | null;
  readonly oauthStatusKnown: boolean;
  readonly hasAnySocialConnection: boolean;
  readonly pathname?: string;
}

function isDashboardPath(pathname: string | undefined): boolean {
  return pathname === "/dashboard" || Boolean(pathname?.startsWith("/dashboard/"));
}

export function shouldShowFirstAccountBanner(
  state: FirstAccountBannerState,
): boolean {
  return (
    !state.isWorkspaceSelection &&
    !isDashboardPath(state.pathname) &&
    !state.isLoading &&
    state.profilesError === null &&
    state.oauthStatusKnown &&
    !state.hasAnySocialConnection
  );
}
