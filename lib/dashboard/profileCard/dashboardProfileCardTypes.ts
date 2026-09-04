/** Normalized view for the dashboard profile hero (per selected platform). */
export interface DashboardProfileCardView {
  readonly platformLabel: string;
  /** Main headline: @handle, channel title, etc. */
  readonly primaryLine: string;
  /** Optional second line: real name, category, etc. */
  readonly secondaryLine?: string;
  readonly avatarUrl: string | null;
  /** Three stat chips (e.g. posts / followers / following). */
  readonly stats: readonly { readonly label: string; readonly value: string }[];
  readonly bio: string | null;
  readonly visitUrl: string | null;
  readonly showVerifiedBadge: boolean;
}
