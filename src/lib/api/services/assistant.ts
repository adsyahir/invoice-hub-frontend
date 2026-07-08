/**
 * InvoiceHub AI copilot — streaming client.
 *
 * `streamAssistantReply` POSTs to the backend's Spring AI endpoint
 * (POST /api/ai/chat) and yields decoded text chunks as they arrive. The
 * endpoint streams Server-Sent Events whose data is `{"c":"<chunk>"}`; we parse
 * those and yield the `c` payloads. The AssistantPage consumes this generator and
 * is unaware of the transport.
 */
import { useAuthStore } from "@/stores/auth-store";

export type AssistantRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: string;
}

export interface AssistantQuery {
  prompt: string;
  /** Prior turns, oldest first — sent as context to the model. */
  history: { role: AssistantRole; content: string }[];
}

/** Prompt chips shown on an empty conversation. */
export const suggestedPrompts = [
  "What invoices are overdue?",
  "Who owes me the most right now?",
  "Summarize my receivables",
  "Break down my MyInvois e-invoice statuses",
  "How does LHDN MyInvois e-invoicing work?",
] as const;

// Mirrors the axios baseURL (src/lib/api/services/axios.ts): same-origin through
// the Vite proxy by default, or VITE_BACKEND_URL for a direct cross-origin call.
const BASE_URL = (import.meta.env.VITE_BACKEND_URL ?? "") + "/api";

/**
 * Stream an assistant reply as text chunks from the backend.
 *
 * Uses `fetch` (not axios) because axios buffers the whole response in the
 * browser and can't expose a readable stream. The bearer token is read from the
 * same auth store the axios interceptor uses.
 */
export async function* streamAssistantReply(
  q: AssistantQuery,
): AsyncGenerator<string> {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${BASE_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(q),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Assistant request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line. Process each complete event and
    // keep the remainder in the buffer.
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const ev = parseEvent(rawEvent);
      if (ev.done) return; // explicit end-of-stream marker → stop deterministically
      if (ev.text) yield ev.text;
    }
  }
}

/** Parse one SSE event's `data:` line(s) into a chunk or an end marker. */
function parseEvent(rawEvent: string): { text: string; done: boolean } {
  const dataLines = rawEvent
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.slice(5).trimStart());
  if (dataLines.length === 0) return { text: "", done: false };
  try {
    const obj = JSON.parse(dataLines.join("\n")) as { c?: string; done?: boolean };
    if (obj.done === true) return { text: "", done: true };
    return { text: typeof obj.c === "string" ? obj.c : "", done: false };
  } catch {
    return { text: "", done: false };
  }
}
