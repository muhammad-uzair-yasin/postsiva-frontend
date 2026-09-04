# Frontend Flow Map

## Workspace shell (sidebar mode)

| Area | Path / component | Purpose |
|------|------------------|---------|
| Top header | `app/(workspace)/_components/shell/WorkspaceShellHeader.tsx` | Workspace switcher, channel picker, profile menu (user settings + logout). |
| Sidebar | `WorkspaceSidebar.tsx` | Create button, main nav, workspace footer (social accounts, members, brand voice, settings gear). |
| Settings hub | `/settings` → `WorkspaceSettingsHubClient` | Publer-style row list; sub-routes for general, members, brand voice, etc. |

## Workspace Routes

| Route | Screen | Purpose |
|-------|--------|---------|
| `/content-manager` with WordPress selected | `app/(workspace)/wordpress/blogs/_components/WordPressBlogsScreen.tsx` | List, force-refresh, edit, and delete connected WordPress blog posts inside Published Content. |
| `/library` | `app/(workspace)/library/_components/LibraryScreen.tsx` | Workspace media library page (sidebar entry after Drafts): image/video grid with filter, upload, delete, download, and "Use in post" which pre-attaches the media in the composer. Composer attach button now opens a device/library source-picker modal instead of an inline library panel. Includes a Postsiva Library / Stock section switcher: Stock shows a merged, provider-neutral free stock feed (default curated results, search, image/video toggle, orientation/size/color filters) with Use-in-post and Save-to-library, both importing the asset into Postsiva storage via `/stock-media/import`. |

## Admin Routes

| Route | Screen | Purpose |
|-------|--------|---------|
| `/admin/system-prompts` | `app/(admin)/admin/system-prompts/` | Edit agent system prompts (versions + reset). |
| `/admin/agent-flows` | `app/(admin)/admin/agent-flows/` | Static map of which agents/model routes run per product flow. |
