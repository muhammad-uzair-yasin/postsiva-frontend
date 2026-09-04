import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";

type GenResult =
  | { success: true; replies: { reply_text: string }[] }
  | { success: false; message: string };

export async function runUnrepliedBulkGenerateAll(
  bulkTargets: readonly UnifiedInboxMessage[],
  generateForMessage: (
    message: UnifiedInboxMessage,
    moderatorNote: string,
  ) => Promise<GenResult>,
  onRowStart: (id: string) => void,
  onRowEnd: (id: string) => void,
  onFailRow: (id: string) => void,
  onDraft: (id: string, text: string) => void,
): Promise<string[]> {
  const failures: string[] = [];
  for (const m of bulkTargets) {
    onRowStart(m.id);
    try {
      const out = await generateForMessage(m, "");
      if (!out.success) {
        failures.push(`${m.userName}: ${out.message}`);
        onFailRow(m.id);
        continue;
      }
      const first = out.replies.find((r) => r.reply_text.trim().length > 0);
      if (!first) {
        failures.push(`${m.userName}: No reply text returned`);
        onFailRow(m.id);
        continue;
      }
      onDraft(m.id, first.reply_text.trim());
    } catch (e) {
      failures.push(
        `${m.userName}: ${e instanceof Error ? e.message : "Error"}`,
      );
      onFailRow(m.id);
    } finally {
      onRowEnd(m.id);
    }
  }
  return failures;
}

export async function runUnrepliedBulkPostAll(
  queue: readonly { m: UnifiedInboxMessage; text: string }[],
  sendQuickReply: (payload: {
    target: NonNullable<UnifiedInboxMessage["replyApiTarget"]>;
    text: string;
  }) => Promise<{ success: boolean; message?: string }>,
  onRowStart: (id: string) => void,
  onRowEnd: (id: string) => void,
  onSuccess: (id: string) => void,
): Promise<string[]> {
  const failures: string[] = [];
  for (const { m, text } of queue) {
    const target = m.replyApiTarget;
    if (!target) {
      continue;
    }
    onRowStart(m.id);
    try {
      const r = await sendQuickReply({ target, text });
      if (!r.success) {
        failures.push(`${m.userName}: ${r.message ?? "Failed"}`);
        continue;
      }
      onSuccess(m.id);
    } catch (e) {
      failures.push(
        `${m.userName}: ${e instanceof Error ? e.message : "Error"}`,
      );
    } finally {
      onRowEnd(m.id);
    }
  }
  return failures;
}
