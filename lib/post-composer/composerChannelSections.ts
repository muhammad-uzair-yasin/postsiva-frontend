import type { ComposerContentMode } from "./composerContentModeTypes";
import type { ComposerPostingAccount } from "./composerPostingAccount";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";

export type ComposerChannelSection = "social" | "blog";

export function isBlogHeaderAccount(row: Pick<WorkspaceHeaderAccountRow, "id" | "iconId">): boolean {
  return row.iconId === "wordpress" || row.id.startsWith("wordpress:");
}

export function isBlogComposerAccount(
  account: Pick<ComposerPostingAccount, "platform" | "id">,
): boolean {
  return account.platform === "wordpress" || account.id.startsWith("wordpress:");
}

export function composerChannelSectionForHeaderAccount(
  row: Pick<WorkspaceHeaderAccountRow, "id" | "iconId">,
): ComposerChannelSection {
  return isBlogHeaderAccount(row) ? "blog" : "social";
}

export function deriveContentModeFromSelectedAccounts(
  accounts: readonly Pick<ComposerPostingAccount, "platform" | "id">[],
): ComposerContentMode {
  if (accounts.length === 0) {
    return "social";
  }
  const hasBlog = accounts.some(isBlogComposerAccount);
  return hasBlog ? "blog" : "social";
}

export function filterHeaderAccountsForSection(
  accounts: readonly WorkspaceHeaderAccountRow[],
  section: ComposerChannelSection,
): WorkspaceHeaderAccountRow[] {
  return accounts.filter((row) =>
    composerChannelSectionForHeaderAccount(row) === section,
  );
}

/** When `activeSection` is set, accounts in the other section are disabled with section-specific messages. */
export function withOppositeSectionDisabled(
  accounts: readonly WorkspaceHeaderAccountRow[],
  activeSection: ComposerChannelSection | null,
  messages: {
    readonly socialBlocked: string;
    readonly blogBlocked: string;
  },
): WorkspaceHeaderAccountRow[] {
  if (!activeSection) {
    return [...accounts];
  }
  return accounts.map((row) => {
    const rowSection = composerChannelSectionForHeaderAccount(row);
    if (rowSection === activeSection) {
      return row;
    }
    if (row.disabled === true) {
      return row;
    }
    return {
      ...row,
      disabled: true,
      disabledMessage:
        rowSection === "social" ? messages.socialBlocked : messages.blogBlocked,
    };
  });
}

export function activeComposerChannelSection(
  selectedIds: readonly string[],
  resolveRow: (id: string) => WorkspaceHeaderAccountRow | undefined,
): ComposerChannelSection | null {
  for (const id of selectedIds) {
    const row = resolveRow(id);
    if (row) {
      return composerChannelSectionForHeaderAccount(row);
    }
  }
  return null;
}

/** @deprecated Use withOppositeSectionDisabled */
export function withInactiveSectionAccounts(
  accounts: readonly WorkspaceHeaderAccountRow[],
  activeSection: ComposerChannelSection,
  inactiveMessage: string,
): WorkspaceHeaderAccountRow[] {
  return [
    ...withOppositeSectionDisabled(accounts, activeSection, {
      socialBlocked: inactiveMessage,
      blogBlocked: inactiveMessage,
    }),
  ];
}

export function splitComposerAccountsBySection(
  accounts: readonly ComposerPostingAccount[],
): {
  readonly social: ComposerPostingAccount[];
  readonly blog: ComposerPostingAccount[];
} {
  const social: ComposerPostingAccount[] = [];
  const blog: ComposerPostingAccount[] = [];
  for (const account of accounts) {
    if (isBlogComposerAccount(account)) {
      blog.push(account);
    } else {
      social.push(account);
    }
  }
  return { social, blog };
}
