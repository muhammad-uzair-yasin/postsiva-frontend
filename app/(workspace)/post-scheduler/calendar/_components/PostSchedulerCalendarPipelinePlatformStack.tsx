"use client";

import { PIPELINE_LIST_PLATFORM_ICON } from "../_data/pipelineListPlatformIcons";
import type { PipelinePlatformId } from "../_types/postSchedulerCalendarListTypes";

interface PostSchedulerCalendarPipelinePlatformStackProps {
  platforms: readonly PipelinePlatformId[];
}

export function PostSchedulerCalendarPipelinePlatformStack({
  platforms,
}: PostSchedulerCalendarPipelinePlatformStackProps): React.ReactElement {
  return (
    <div className="flex -space-x-2">
      {platforms.map((p) => {
        const icon = PIPELINE_LIST_PLATFORM_ICON[p];
        return (
          <div
            key={p}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-surface bg-surface-container-high"
          >
            <img alt="" className="h-3 w-3 object-contain" src={icon.src} />
          </div>
        );
      })}
    </div>
  );
}
