# Tasks: Dropdown Refresh Button

## Tasks

- [ ] 1. `WorkspaceHeaderAccountsProvider.tsx` — Add `refreshAllUnifiedProfiles(): Promise<void>` to the context interface and implement it: fetch `fetchUnifiedUserProfiles` with `forceRefresh: true` and `platforms: []` (all), then call `notifyUnifiedProfilesMerged`. Expose it in the context value.
- [ ] 2. `WorkspaceAccountDropdownMenu.tsx` — Add optional `onRefresh?: () => Promise<void>` prop to both variants. In the header div, add a refresh icon button (`refresh` material symbol) aligned to the right. Track `isRefreshing` local state; on click set it true, await `onRefresh()`, set it false. Apply `animate-spin` class while spinning and `disabled` attribute.
- [ ] 3. `WorkspaceSidebarChannelModal.tsx` — Destructure `refreshAllUnifiedProfiles` from `useWorkspaceHeaderAccounts()` and pass it as `onRefresh` to `WorkspaceAccountDropdownMenu`.
