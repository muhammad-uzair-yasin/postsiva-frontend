import type { ContentManagerChannelFilter } from "../_types/contentManagerTypes";

type LabelsByFilter = Partial<Record<ContentManagerChannelFilter, string>>;

export function getVisibleContentManagerChannelFilters(
  isLoading: boolean,
  labelsByFilter: LabelsByFilter,
): ContentManagerChannelFilter[] {
  if (isLoading) {
    return ["all"];
  }

  const connected = Object.keys(labelsByFilter).filter(
    (k): k is Exclude<ContentManagerChannelFilter, "all"> => k !== "all",
  );

  // Preserve insertion order from `labelsByFilter` so numbering remains stable.
  return ["all", ...connected];
}

