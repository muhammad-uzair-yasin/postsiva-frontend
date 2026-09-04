"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PostSchedulerImageGenerationTimerProps {
  readonly isGenerating: boolean;
}

export function PostSchedulerImageGenerationTimer({
  isGenerating,
}: PostSchedulerImageGenerationTimerProps): React.ReactElement | null {
  const { t } = useTranslations();
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (!isGenerating) {
      setSeconds(60);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) return 1;
        if (prev <= 5) return prev - 0.1;
        if (prev <= 10) return prev - 0.3;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
      <span
        className="material-symbols-outlined text-base animate-spin"
        style={{ animationDuration: "2s" }}
      >
        progress_activity
      </span>
      <span>{t("postScheduler.aiToolkit.estimatedSeconds", { seconds: Math.ceil(seconds) })}</span>
    </div>
  );
}
