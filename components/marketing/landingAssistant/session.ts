/** Session persistence for the public landing Postsiva Assistant FAB. */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface PersistedSession {
  sessionId: string;
  messages: ChatMessage[];
}

export const STORAGE_KEY = "postsiva_assistant_session";
export const MAX_STORED_MESSAGES = 20;

export function makeWelcomeMessage(content: string): ChatMessage {
  return { id: "welcome", role: "assistant", content };
}

export function generateSessionId(): string {
  return `ps_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function loadSession(welcomeContent: string): PersistedSession {
  const welcome = makeWelcomeMessage(welcomeContent);
  if (typeof window === "undefined") {
    return { sessionId: generateSessionId(), messages: [welcome] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedSession;
      if (parsed.sessionId && Array.isArray(parsed.messages)) {
        const hasWelcome = parsed.messages.some((m) => m.id === "welcome");
        const messages = hasWelcome
          ? parsed.messages.map((m) =>
              m.id === "welcome" ? { ...m, content: welcomeContent } : m,
            )
          : [welcome, ...parsed.messages];
        return { ...parsed, messages };
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return { sessionId: generateSessionId(), messages: [welcome] };
}

export function saveSession(
  session: PersistedSession,
  welcomeContent: string,
): void {
  if (typeof window === "undefined") return;
  const welcome = makeWelcomeMessage(welcomeContent);
  try {
    const trimmed =
      session.messages.length > MAX_STORED_MESSAGES
        ? [
            welcome,
            ...session.messages
              .filter((m) => m.id !== "welcome")
              .slice(-(MAX_STORED_MESSAGES - 1)),
          ]
        : session.messages;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...session, messages: trimmed }),
    );
  } catch {
    /* ignore storage errors */
  }
}

/** Replace welcome bubble content when locale changes. */
export function updateWelcomeInSession(
  session: PersistedSession,
  welcomeContent: string,
): PersistedSession {
  return {
    ...session,
    messages: session.messages.map((m) =>
      m.id === "welcome" ? { ...m, content: welcomeContent } : m,
    ),
  };
}
