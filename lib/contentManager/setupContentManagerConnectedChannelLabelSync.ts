import {
  SOCIAL_OAUTH_STATUS_UPDATED_EVENT,
  type SocialOAuthStatusUpdatedDetail,
} from "@/lib/social/unifiedOAuthApi";
import {
  UNIFIED_PROFILES_MERGED_EVENT,
  type UnifiedProfilesMergedDetail,
} from "@/lib/dashboard/unifiedProfilesPartialMerge";
import {
  getConnectedContentManagerChannelLabelsFromCachesOnly,
  type ConnectedContentManagerChannelLabels,
} from "./fetchConnectedContentManagerChannelLabels";

type SyncCallbacks = {
  onLoading: (v: boolean) => void;
  onError: (v: string | null) => void;
  onLabels: (v: ConnectedContentManagerChannelLabels) => void;
};

export function setupContentManagerConnectedChannelLabelSync(
  token: string,
  workspaceId: string,
  callbacks: SyncCallbacks,
): () => void {
  let cancelled = false;

  const load = (): void => {
    callbacks.onLoading(true);
    callbacks.onError(null);
    try {
      const labels: ConnectedContentManagerChannelLabels =
        getConnectedContentManagerChannelLabelsFromCachesOnly(workspaceId);
      if (cancelled) return;
      callbacks.onLabels(labels);
      callbacks.onLoading(false);
    } catch (e) {
      if (cancelled) return;
      callbacks.onError(
        e instanceof Error ? e.message : "Could not load channel accounts",
      );
      callbacks.onLabels({});
      callbacks.onLoading(false);
    }
  };

  load();

  const oauthHandler = (ev: Event): void => {
    const d = (ev as CustomEvent<SocialOAuthStatusUpdatedDetail>).detail;
    if (d && d.workspaceId === workspaceId) {
      void load();
    }
  };
  const unifiedHandler = (ev: Event): void => {
    const d = (ev as CustomEvent<UnifiedProfilesMergedDetail>).detail;
    if (d && d.workspaceId === workspaceId) {
      void load();
    }
  };

  window.addEventListener(SOCIAL_OAUTH_STATUS_UPDATED_EVENT, oauthHandler);
  window.addEventListener(UNIFIED_PROFILES_MERGED_EVENT, unifiedHandler);

  return () => {
    cancelled = true;
    window.removeEventListener(
      SOCIAL_OAUTH_STATUS_UPDATED_EVENT,
      oauthHandler,
    );
    window.removeEventListener(UNIFIED_PROFILES_MERGED_EVENT, unifiedHandler);
  };
}

