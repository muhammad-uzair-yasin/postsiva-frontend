"use client";

import type { ReactElement } from "react";

import { FloatingAiProgressOrb } from "@/app/(workspace)/_components/FloatingAiProgressOrb";

export interface MultiChannelGenerateProgress {
  readonly total: number;
  readonly completed: number;
}

interface PostSchedulerMultiGenerateProgressOrbProps {
  readonly progress: MultiChannelGenerateProgress | null;
  readonly stage?: string | null;
}

/** Fixed top-left orb during parallel per-channel generation (multi-channel scope only). */
export function PostSchedulerMultiGenerateProgressOrb({
  progress,
  stage,
}: PostSchedulerMultiGenerateProgressOrbProps): ReactElement | null {
  const determinate =
    progress != null && progress.total > 1
      ? { total: progress.total, completed: progress.completed }
      : null;

  return (
    <FloatingAiProgressOrb
      determinate={determinate}
      indeterminate={stage != null && stage.trim().length > 0}
      label="generating"
      labelTextOverride={stage}
    />
  );
}
