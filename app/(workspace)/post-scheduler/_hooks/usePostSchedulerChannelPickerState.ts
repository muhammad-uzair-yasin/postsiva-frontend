import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import { isPostingSelectableHeaderAccount } from "@/lib/workspace/headerAccountGrouping";
import {
  composerChannelSectionForHeaderAccount,
  type ComposerChannelSection,
} from "@/lib/post-composer/composerChannelSections";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import {
  headerRowToComposerChannel,
  type ComposerChannelAccount,
} from "../_data/postSchedulerComposerChannelAccounts";
import { loadComposerSessionCacheForActiveWorkspace } from "@/lib/post-composer/composerSessionCache";

export function usePostSchedulerChannelPickerState(): {
  selectedIds: string[];
  selectedAccounts: ComposerChannelAccount[];
  toggleAccountId: (id: string) => void;
  toggleAccountIdInSection: (id: string, section: ComposerChannelSection) => void;
  removeAccountId: (id: string) => void;
  selectAccountIds: (ids: readonly string[]) => void;
  headerAccounts: readonly WorkspaceHeaderAccountRow[];
  isLoadingProfiles: boolean;
  profilesError: string | null;
} {
  const { accounts, selectedAccountId, isLoadingProfiles, profilesError } =
    useWorkspaceHeaderAccounts();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const cached = loadComposerSessionCacheForActiveWorkspace();
    if (cached?.selectedIds?.length) {
      return [...cached.selectedIds];
    }
    return [];
  });

  const postSchedulerAccounts = useMemo(
    () =>
      accounts.filter(
        (a) =>
          !isWorkspaceHeaderAllPlatformsId(a.id) &&
          isPostingSelectableHeaderAccount(a),
      ),
    [accounts],
  );

  const accountIdSet = useMemo(
    () => new Set(postSchedulerAccounts.map((a) => a.id)),
    [postSchedulerAccounts],
  );

  useEffect(() => {
    if (isLoadingProfiles || profilesError !== null) {
      return;
    }
    // Seed from navbar when empty; otherwise keep multi-select and drop stale ids.
    const navSelected =
      selectedAccountId && !isWorkspaceHeaderAllPlatformsId(selectedAccountId)
        ? selectedAccountId
        : null;
    const defaultId =
      navSelected && accountIdSet.has(navSelected)
        ? navSelected
        : postSchedulerAccounts[0]?.id;
    if (!defaultId) {
      return;
    }
    setSelectedIds((prev) => {
      const cleaned = prev.filter(
        (id) => !isWorkspaceHeaderAllPlatformsId(id) && accountIdSet.has(id),
      );
      if (cleaned.length === 0) {
        return prev.length === 1 && prev[0] === defaultId ? prev : [defaultId];
      }
      if (
        cleaned.length === prev.length &&
        cleaned.every((id, i) => id === prev[i])
      ) {
        return prev;
      }
      return cleaned;
    });
  }, [accountIdSet, isLoadingProfiles, profilesError, selectedAccountId]);

  const byId = useMemo(() => {
    const m = new Map<string, WorkspaceHeaderAccountRow>();
    for (const a of postSchedulerAccounts) {
      m.set(a.id, a);
    }
    return m;
  }, [postSchedulerAccounts]);

  // Follow the sidebar/navbar account when it *changes* while the composer is open
  // (without dropping channels the user already added). Skip the first apply so a
  // create-post / session-cache selection is not merged with the header account.
  const lastNavAppliedRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (isLoadingProfiles || profilesError !== null) {
      return;
    }
    const navSelected =
      selectedAccountId && !isWorkspaceHeaderAllPlatformsId(selectedAccountId)
        ? selectedAccountId
        : null;
    if (!navSelected || !accountIdSet.has(navSelected)) {
      return;
    }
    if (lastNavAppliedRef.current === undefined) {
      lastNavAppliedRef.current = navSelected;
      return;
    }
    if (lastNavAppliedRef.current === navSelected) {
      return;
    }
    lastNavAppliedRef.current = navSelected;
    setSelectedIds((prev) => {
      if (prev.includes(navSelected)) {
        return prev;
      }
      const row = byId.get(navSelected);
      if (!row) {
        return prev;
      }
      const section = composerChannelSectionForHeaderAccount(row);
      const sameSection = prev.filter((existingId) => {
        const existing = byId.get(existingId);
        if (!existing) {
          return false;
        }
        return composerChannelSectionForHeaderAccount(existing) === section;
      });
      return [...sameSection, navSelected];
    });
  }, [accountIdSet, byId, isLoadingProfiles, profilesError, selectedAccountId]);

  const selectedAccounts = useMemo(
    () =>
      selectedIds
        .map((id) => byId.get(id))
        .filter((a): a is WorkspaceHeaderAccountRow => Boolean(a))
        .map(headerRowToComposerChannel),
    [byId, selectedIds],
  );

  const toggleAccountId = useCallback(
    (id: string) => {
      if (!id || isWorkspaceHeaderAllPlatformsId(id)) {
        return;
      }
      const row = byId.get(id);
      if (!row) {
        return;
      }
      const section = composerChannelSectionForHeaderAccount(row);
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((x) => x !== id);
        }
        const activeSection = ((): ComposerChannelSection | null => {
          for (const existingId of prev) {
            const existing = byId.get(existingId);
            if (existing) {
              return composerChannelSectionForHeaderAccount(existing);
            }
          }
          return null;
        })();
        if (activeSection !== null && activeSection !== section) {
          return prev;
        }
        const sameSection = prev.filter((existingId) => {
          const existing = byId.get(existingId);
          if (!existing) {
            return false;
          }
          return composerChannelSectionForHeaderAccount(existing) === section;
        });
        return [...sameSection, id];
      });
    },
    [byId],
  );

  const toggleAccountIdInSection = useCallback(
    (id: string, section: ComposerChannelSection) => {
      if (!id || isWorkspaceHeaderAllPlatformsId(id)) {
        return;
      }
      const row = byId.get(id);
      if (!row || composerChannelSectionForHeaderAccount(row) !== section) {
        return;
      }
      toggleAccountId(id);
    },
    [byId, toggleAccountId],
  );

  const removeAccountId = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const selectAccountIds = useCallback(
    (ids: readonly string[]) => {
      const cleaned = ids.filter(
        (id) => !isWorkspaceHeaderAllPlatformsId(id) && accountIdSet.has(id),
      );
      if (cleaned.length === 0) {
        return;
      }
      setSelectedIds(cleaned);
    },
    [accountIdSet],
  );

  return {
    selectedIds,
    selectedAccounts,
    toggleAccountId,
    toggleAccountIdInSection,
    removeAccountId,
    selectAccountIds,
    headerAccounts: postSchedulerAccounts,
    isLoadingProfiles,
    profilesError,
  };
}

/** Single locked channel for WordPress draft/scheduled edit composer. */
export function useLockedComposerChannelState(lockedAccountId: string): {
  selectedIds: string[];
  selectedAccounts: ComposerChannelAccount[];
  toggleAccountId: (id: string) => void;
  toggleAccountIdInSection: (id: string, section: ComposerChannelSection) => void;
  removeAccountId: (id: string) => void;
  selectAccountIds: (ids: readonly string[]) => void;
  headerAccounts: readonly WorkspaceHeaderAccountRow[];
  isLoadingProfiles: boolean;
  profilesError: string | null;
} {
  const { accounts, isLoadingProfiles, profilesError } =
    useWorkspaceHeaderAccounts();

  const postSchedulerAccounts = useMemo(
    () =>
      accounts.filter(
        (a) =>
          !isWorkspaceHeaderAllPlatformsId(a.id) &&
          isPostingSelectableHeaderAccount(a),
      ),
    [accounts],
  );

  const selectedIds = useMemo(
    () => (lockedAccountId.trim() ? [lockedAccountId.trim()] : []),
    [lockedAccountId],
  );

  const selectedAccounts = useMemo(
    () =>
      postSchedulerAccounts
        .filter((a) => a.id === lockedAccountId)
        .map(headerRowToComposerChannel),
    [lockedAccountId, postSchedulerAccounts],
  );

  const noop = useCallback((_id: string) => {}, []);
  const noopIds = useCallback((_ids: readonly string[]) => {}, []);

  const noopSection = useCallback(
    (_id: string, _section: ComposerChannelSection) => {},
    [],
  );

  return {
    selectedIds,
    selectedAccounts,
    toggleAccountId: noop,
    toggleAccountIdInSection: noopSection,
    removeAccountId: noop,
    selectAccountIds: noopIds,
    headerAccounts: postSchedulerAccounts,
    isLoadingProfiles,
    profilesError,
  };
}
