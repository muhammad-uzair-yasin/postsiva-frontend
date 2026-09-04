/** Drop noisy backend prefixes and turn platform API errors into plain language. */
export function formatPublishFailureMessage(
  message: string,
  error: string | null,
): string {
  let raw = (message || error || "").trim();
  raw = raw.replace(/^post\s*:\s*/i, "");

  for (const prefix of [
    "Error creating video post: ",
    "Failed to upload video: ",
    "Error creating post: ",
  ]) {
    if (raw.startsWith(prefix)) {
      raw = raw.slice(prefix.length).trim();
    }
  }

  const blueskyDuration = parseBlueskyDurationError(raw);
  if (blueskyDuration) {
    return blueskyDuration;
  }

  const threadsError = parseThreadsVideoError(raw);
  if (threadsError) {
    return threadsError;
  }

  return raw;
}

function formatDurationHuman(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  if (minutes > 0 && secs > 0) {
    const m = minutes === 1 ? "minute" : "minutes";
    const s = secs === 1 ? "second" : "seconds";
    return `${minutes} ${m} and ${secs} ${s}`;
  }
  if (minutes > 0) {
    return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  }
  return secs === 1 ? "1 second" : `${secs} seconds`;
}

function parseBlueskyDurationError(raw: string): string | null {
  const fromJson = extractBlueskyErrorField(raw);
  const text = fromJson ?? raw;

  const match = text.match(
    /video duration\s*\(([\d.]+)\s*sec\).*maximum allowed duration\s*\(([\d.]+)\s*sec\)/i,
  );
  if (!match) {
    return null;
  }

  const actual = Number.parseFloat(match[1] ?? "");
  const limit = Number.parseFloat(match[2] ?? "");
  if (!Number.isFinite(actual) || !Number.isFinite(limit)) {
    return null;
  }

  return (
    `Your video is too long for Bluesky. The maximum length is ` +
    `${formatDurationHuman(limit)}, but your video is about ` +
    `${formatDurationHuman(actual)} long.`
  );
}

function extractBlueskyErrorField(raw: string): string | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const candidates = jsonMatch ? [raw, jsonMatch[0]] : [raw];
  for (const candidate of candidates) {
    try {
      const data = JSON.parse(candidate) as { error?: string; message?: string };
      const err = (data.error || data.message || "").trim();
      if (err) {
        return err;
      }
    } catch {
      // not JSON
    }
  }
  return null;
}

function parseThreadsVideoError(raw: string): string | null {
  const match = raw.match(
    /Threads container processing failed with status=(\w+):\s*(.*)$/i,
  );
  if (!match) {
    return null;
  }

  const detail = (match[2] ?? "").trim();
  if (detail && detail.toUpperCase() !== "UNKNOWN" && detail !== "No error_message from API") {
    return `Threads couldn't publish this video: ${detail}`;
  }

  return (
    "Threads couldn't process this video. Videos must be 5 minutes or shorter " +
    "and in a supported format (MP4). Try a shorter or smaller video."
  );
}
