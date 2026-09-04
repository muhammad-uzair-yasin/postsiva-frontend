# Task: Dropdown Refresh Button

## Goal
Add a refresh icon button in the top-right corner of the "Connected accounts" dropdown header.
Clicking it force-refreshes `GET /unified/user-profiles/` for all platforms and updates the
sidebar account list reactively — without a page reload.

## Requirements
1. A refresh icon button sits in the header row of `WorkspaceAccountDropdownMenu`, aligned to the right.
2. Clicking it calls `refreshUnifiedProfilesForSelectedAccount` — but since we want a full refresh
   (not just the selected account), we need a new `refreshAllUnifiedProfiles` function exposed from
   `WorkspaceHeaderAccountsProvider` that fetches all platforms with `forceRefresh: true`.
3. While refreshing, the button shows a spinning animation and is disabled.
4. On completion (success or error), the button returns to its normal state.
5. The refresh is best-effort — errors are swallowed silently (no error UI needed).

## Acceptance Criteria
- [ ] Refresh button visible in the top-right of the dropdown header.
- [ ] Clicking it triggers a force-refresh of unified profiles.
- [ ] Button spins while loading and is disabled to prevent double-clicks.
- [ ] After refresh, the account list updates (disconnected accounts disappear, new ones appear).
- [ ] No error UI shown on failure — button just stops spinning.

## Files to Change
- `app/(workspace)/_components/WorkspaceHeaderAccountsProvider.tsx`
  — Add `refreshAllUnifiedProfiles: () => Promise<void>` to context + implementation.
- `app/(workspace)/_components/WorkspaceAccountDropdownMenu.tsx`
  — Accept `onRefresh?: () => Promise<void>` prop, render refresh button in header.
- `app/(workspace)/_components/WorkspaceSidebarChannelModal.tsx`
  — Pass `onRefresh` from `useWorkspaceHeaderAccounts` down to `WorkspaceAccountDropdownMenu`.
