/** Map raw AI/API/network errors to short user-facing copy (hide provider/timeout internals). */

const NETWORK_HINT =
  /\b(failed to fetch|networkerror|network request failed|load failed|err_connection|econnrefused|econnreset|enotfound|offline|abort(ed)?)\b/i;

const TECHNICAL_AI_HINT =
  /\b(pollinations|openrouter|nanobanana|gptimage|gemini-2\.5|timed?\s*out|timeout|cascade|provider|digitalocean|anthropic|http\s*[45]\d\d|status\s*[45]\d\d|no image data|all image_.*failed)\b/i;

const AI_CREDIT_HINT =
  /\b(insufficient[_\s-]*ai[_\s-]*credits?|not enough ai credits?|need \d+ ai credits?|only have \d+ available|run out of ai credits?|out of ai credits?)\b/i;

export type UserFacingAiErrorCopy = {
  aiDown: string;
  aiCredits?: string;
  network: string;
  fallback: string;
};

export function userFacingAiErrorMessage(
  error: unknown,
  copy: UserFacingAiErrorCopy,
): string {
  const raw =
    error instanceof Error
      ? error.message.trim()
      : typeof error === "string"
        ? error.trim()
        : "";

  if (!raw) return copy.fallback;

  if (AI_CREDIT_HINT.test(raw)) {
    return copy.aiCredits ?? raw;
  }

  if (NETWORK_HINT.test(raw)) {
    return copy.network;
  }

  if (TECHNICAL_AI_HINT.test(raw)) {
    return copy.aiDown;
  }

  // Keep short product validation messages; hide long/stack-like payloads
  if (raw.length <= 160 && !/[{\\[\\]|Traceback|Exception:/i.test(raw)) {
    return raw;
  }

  return copy.aiDown;
}
