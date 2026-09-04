"use client";

import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";

import {
  SocialInboxReplyComposer,
  type SocialInboxBulkComposerProps,
} from "./SocialInboxReplyComposer";

interface SocialInboxReplyComposerPanelProps {
  readonly message: UnifiedInboxMessage;
  readonly bulk: SocialInboxBulkComposerProps | null;
  readonly open: boolean;
  readonly indent: boolean;
  readonly suppressFloatingOrb: boolean;
  readonly onReload: (message: UnifiedInboxMessage) => void | Promise<void>;
  readonly onReplyPosted?: () => void;
  readonly onReplyGenerated?: () => void;
}

export function SocialInboxReplyComposerPanel({
  message,
  bulk,
  open,
  indent,
  suppressFloatingOrb,
  onReload,
  onReplyPosted,
  onReplyGenerated,
}: SocialInboxReplyComposerPanelProps): React.ReactElement {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none motion-reduce:duration-0 ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`flex gap-4 pt-3 transition-[opacity,transform] duration-300 ease-in-out motion-reduce:transform-none motion-reduce:transition-none motion-reduce:duration-0 ${
            indent ? "ml-12" : ""
          } ${
            open
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0 motion-reduce:translate-y-0"
          }`}
          aria-hidden={!open}
          inert={!open}
        >
          <div className={`shrink-0 ${indent ? "w-7" : "w-9"}`} aria-hidden />
          <div className="min-w-0 flex-1">
            <SocialInboxReplyComposer
              message={message}
              bulk={bulk}
              suppressFloatingOrb={suppressFloatingOrb}
              onReload={onReload}
              onReplyPosted={onReplyPosted}
              onReplyGenerated={onReplyGenerated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
