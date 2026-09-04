"use client";

import { FormEvent, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { submitUnifiedFeedback } from "@/lib/feedback/submitUnifiedFeedback";

import type {
  FeedbackCategoryId,
  FeedbackPriorityId,
} from "../_types/feedbackForm";
import { FeedbackCategoryGrid } from "./FeedbackCategoryGrid";
import { FeedbackFormPanel } from "./FeedbackFormPanel";

export function FeedbackMainColumn(): React.ReactElement {
  const { t } = useTranslations();
  const [category, setCategory] = useState<FeedbackCategoryId>("feature");
  const [priority, setPriority] = useState<FeedbackPriorityId>("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const s = subject.trim();
    const d = description.trim();
    if (s.length < 3) {
      setSubmitError(t("feedback.errorSubjectMin"));
      return;
    }
    if (d.length < 5) {
      setSubmitError(t("feedback.errorDescriptionMin"));
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    void (async (): Promise<void> => {
      const result = await submitUnifiedFeedback({
        category,
        priority,
        subject: s,
        description: d,
      });
      setIsSubmitting(false);
      if (!result.ok) {
        setSubmitError(result.error ?? t("feedback.errorSendFailed"));
        return;
      }
      setStatus("sent");
    })();
  };

  return (
    <div className="space-y-12">
      <FeedbackCategoryGrid value={category} onChange={setCategory} />
      <FeedbackFormPanel
        category={category}
        priority={priority}
        onPriorityChange={setPriority}
        subject={subject}
        onSubjectChange={setSubject}
        description={description}
        onDescriptionChange={setDescription}
        status={status}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onSubmit={onSubmit}
        onSubmitAnother={() => {
          setStatus("idle");
          setSubject("");
          setDescription("");
          setSubmitError(null);
        }}
      />
    </div>
  );
}
