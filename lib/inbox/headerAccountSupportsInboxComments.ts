import { accountIdToOAuthPlatform } from "@/lib/workspace/accountIdToOAuthPlatform";

/** Whether workspace header account id can load GET /unified/comments/ (bulk or by-post). */
export function headerAccountSupportsInboxComments(accountId: string | null): boolean {
  const id = accountId?.trim();
  if (!id) {
    return false;
  }
  return accountIdToOAuthPlatform(id) !== null;
}
