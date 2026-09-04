import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";

export type ComposerDraftScope = "all_channels" | "per_channel";

export interface PerChannelDraftSnapshot {
  readonly body: string;
  readonly media: ComposerAttachedMedia[];
}
