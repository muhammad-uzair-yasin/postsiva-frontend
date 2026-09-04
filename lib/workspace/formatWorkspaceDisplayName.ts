/** Human-readable workspace label: underscores → spaces, collapsed whitespace trimmed. */
export function formatWorkspaceDisplayName(name: string): string {
  return name.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}
