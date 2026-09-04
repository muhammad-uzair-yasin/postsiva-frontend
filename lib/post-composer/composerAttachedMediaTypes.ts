/** Required credit for stock sources like Unsplash; rendered next to the media. */
export interface ComposerMediaAttribution {
  readonly provider: string;
  readonly creatorName: string;
  readonly creatorProfileUrl: string;
  readonly sourcePageUrl?: string;
  /** Unsplash username when available (prefer @handle in post-body credit). */
  readonly creatorUsername?: string;
}

/** Media attached to the composer draft (from gallery upload or unified library). */
export interface ComposerAttachedMedia {
  readonly mediaId: string;
  readonly publicUrl: string;
  readonly mediaType: "image" | "video" | "document";
  readonly filename: string;
  readonly thumbnailUrl?: string;
  /** Populated after client-side probe (file pick, library URL, or upload). */
  readonly durationSeconds?: number;
  /** Bytes when known (device upload `File.size` or library `file_size`). */
  readonly fileSizeBytes?: number;
  readonly attribution?: ComposerMediaAttribution;
  /** Source marker for media that can be reopened in Canva. */
  readonly source?: "canva";
  readonly canvaDesignId?: string;
}
