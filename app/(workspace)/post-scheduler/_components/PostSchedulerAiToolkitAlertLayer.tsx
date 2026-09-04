"use client";

import { usePostSchedulerAiToolkit } from "../_context/PostSchedulerAiToolkitContext";
import { PostSchedulerAiAlertModal } from "./PostSchedulerAiAlertModal";

export function PostSchedulerAiToolkitAlertLayer(): React.ReactElement {
  const { alert, dismissAlert } = usePostSchedulerAiToolkit();
  return (
    <PostSchedulerAiAlertModal
      visible={alert !== null}
      title={alert?.title ?? ""}
      message={alert?.message ?? ""}
      onClose={dismissAlert}
    />
  );
}
