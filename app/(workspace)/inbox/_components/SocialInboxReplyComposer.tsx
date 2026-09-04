"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

import { UpgradeRequiredBanner } from "@/components/billing/UpgradeRequiredBanner";
import { usePlanFeature } from "@/lib/billing/BillingContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { resolveBillingFeatureLabel } from "@/lib/i18n/resolveBillingFeatureLabel";
import { inboxMessageSupportsAiGenerate } from "@/lib/inbox/inboxAiGenerateEligibility";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";

import { FloatingAiProgressOrb } from "@/app/(workspace)/_components/FloatingAiProgressOrb";
import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";

import { useUnifiedCommentGenerate } from "../_hooks/useUnifiedCommentGenerate";
import { useUnifiedCommentReply } from "../_hooks/useUnifiedCommentReply";
import { SocialInboxReplyDraftField } from "./SocialInboxReplyDraftField";

export interface SocialInboxBulkComposerProps {
  draft: string;
  onDraftChange: (text: string) => void;
  generateBusy: boolean;
  postBusy: boolean;
  onBulkPosted: () => void;
}

interface SocialInboxReplyComposerProps {
  readonly message: UnifiedInboxMessage;
  readonly bulk?: SocialInboxBulkComposerProps | null;
  /** When bulk "Generate/Post all" runs, the list shows the determinate orb; hide the single-row indeterminate orb. */
  readonly suppressFloatingOrb?: boolean;
  readonly onReload: (message: UnifiedInboxMessage) => void | Promise<void>;
  readonly onReplyGenerated?: (message: UnifiedInboxMessage) => void;
  readonly onReplyPosted?: (message: UnifiedInboxMessage) => void;
}

export function SocialInboxReplyComposer({
  message,
  bulk,
  suppressFloatingOrb = false,
  onReload,
  onReplyGenerated,
  onReplyPosted,
}: SocialInboxReplyComposerProps): React.ReactElement {
  const { t } = useTranslations();
  const { unifiedProfiles } = useWorkspaceHeaderAccounts();
  const { generateForMessage } = useUnifiedCommentGenerate();
  const { sendQuickReply } = useUnifiedCommentReply();
  const { enabled: commentAiEnabled, loading: billingLoading } =
    usePlanFeature("auto_replier_enabled");
  const [internalDraft, setInternalDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const aiAvailable =
    commentAiEnabled &&
    inboxMessageSupportsAiGenerate(message, { unifiedProfiles });
  const draft = bulk ? bulk.draft : internalDraft;
  const setDraft = bulk ? bulk.onDraftChange : setInternalDraft;
  const genBusy = bulk ? bulk.generateBusy || isGenerating : isGenerating;
  const sendBlocked = bulk ? bulk.postBusy || isSending : isSending;

  const showRowFloatingOrb =
    !suppressFloatingOrb && (genBusy || sendBlocked);
  const rowOrbLabel: "generating" | "posting" = genBusy
    ? "generating"
    : "posting";

  const runGenerate = useCallback(async () => {
    if (!aiAvailable) {
      setError(t("inbox.errorAiUnavailable"));
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const out = await generateForMessage(message, "");
      if (!out.success) {
        setError(out.message);
        return;
      }
      const first = out.replies.find((r) => r.reply_text.trim().length > 0);
      if (!first) {
        setError(t("inbox.errorNoReplyText"));
        return;
      }
      setDraft(first.reply_text.trim());
      onReplyGenerated?.(message);
    } finally {
      setIsGenerating(false);
    }
  }, [aiAvailable, generateForMessage, message, onReplyGenerated, setDraft, t]);

  const runSend = useCallback(async () => {
    const text = draft.trim();
    const target = message.replyApiTarget;
    if (!text || !target) {
      setError(t("inbox.errorNothingToSend"));
      return;
    }
    setError(null);
    setIsSending(true);
    try {
      const r = await sendQuickReply({ target, text });
      if (!r.success) {
        setError(r.message ?? t("inbox.errorReplyFailed"));
        return;
      }
      if (bulk) {
        bulk.onBulkPosted();
      } else {
        setInternalDraft("");
        setConfirmOpen(false);
      }
      onReplyPosted?.(message);
      void onReload(message);
    } finally {
      setIsSending(false);
    }
  }, [
    bulk,
    draft,
    message,
    onReload,
    onReplyPosted,
    sendQuickReply,
    t,
  ]);

  return (
    <div className="flex flex-col gap-3">
      <FloatingAiProgressOrb
        determinate={null}
        indeterminate={showRowFloatingOrb}
        label={rowOrbLabel}
      />
      <button
        type="button"
        disabled={genBusy || billingLoading || !commentAiEnabled || !aiAvailable}
        title={
          !commentAiEnabled
            ? t("inbox.aiReplyUpgradeTitle")
            : aiAvailable
              ? t("inbox.aiReplyGenerateTitle")
              : t("inbox.aiReplyUnavailableTitle")
        }
        className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-2.5 text-left text-xs font-bold text-primary transition-colors hover:border-primary/40 hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => {
          if (!commentAiEnabled) {
            return;
          }
          void runGenerate();
        }}
      >
        <span
          className="material-symbols-outlined text-base"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {commentAiEnabled ? "auto_awesome" : "lock"}
        </span>
        {commentAiEnabled ? t("inbox.aiReply") : t("inbox.aiReplyPro")}
      </button>

      {!billingLoading && !commentAiEnabled ? (
        <UpgradeRequiredBanner
          featureLabel={resolveBillingFeatureLabel(t, "auto_replier_enabled")}
          compact
        />
      ) : null}

      <SocialInboxReplyDraftField
        draft={draft}
        onDraftChange={setDraft}
        genBusy={genBusy}
        sendBlocked={sendBlocked}
        error={error}
        canSend={Boolean(message.replyApiTarget && draft.trim())}
        onSend={() => {
          if (bulk) {
            void runSend();
            return;
          }
          setConfirmOpen(true);
        }}
      />
      {confirmOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              role="dialog"
              aria-modal="true"
              onClick={() => {
                if (!isSending) setConfirmOpen(false);
              }}
            >
              <div
                className="w-full max-w-sm rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-bold text-on-surface">
                  {t("inbox.replyConfirmTitle")}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                  {t("inbox.replyConfirmBody")}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                    disabled={isSending}
                    onClick={() => setConfirmOpen(false)}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary transition-colors hover:opacity-90 disabled:opacity-40"
                    disabled={isSending}
                    onClick={() => {
                      void runSend();
                    }}
                  >
                    {isSending ? t("inbox.replySending") : t("inbox.sendReply")}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
