import { useEffect, useRef, useState } from "react";
import { Bot, Plus, SendHorizontal, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  streamAssistantReply,
  suggestedPrompts,
  type AssistantMessage,
} from "@/lib/api/services/assistant";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export default function AssistantPage() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep the latest message in view as it streams in.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = async (prompt: string) => {
    const text = prompt.trim();
    if (!text || streaming) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMsg: AssistantMessage = {
      id: newId(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantId = newId();
    const assistantMsg: AssistantMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    try {
      for await (const chunk of streamAssistantReply({ prompt: text, history })) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "Sorry — I couldn't reach the assistant just now. Please try again.",
              }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <PageHeader
        title="Assistant"
        description="Ask about your invoices, clients, payments and MyInvois status."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessages([])}
            disabled={streaming || empty}
          >
            <Plus className="size-4" />
            New chat
          </Button>
        }
      />

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border bg-card"
      >
        {empty ? (
          <EmptyConversation onPick={send} disabled={streaming} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                userInitial={user?.fullName?.[0]?.toUpperCase() ?? "U"}
                streaming={streaming}
              />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="rounded-xl border bg-card p-2">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Message the assistant…  (Enter to send, Shift+Enter for a new line)"
            className="max-h-40 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button
            size="icon"
            onClick={() => send(input)}
            disabled={streaming || !input.trim()}
            aria-label="Send message"
          >
            <SendHorizontal className="size-4" />
          </Button>
        </div>
        <p className="px-2 pb-1 pt-0.5 text-[11px] text-muted-foreground">
          Preview — responses are generated from your workspace's demo data.
        </p>
      </div>
    </div>
  );
}

function EmptyConversation({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Sparkles className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">How can I help?</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          I have visibility into this workspace's invoices, clients, payments and
          LHDN e-invoice status. Pick a starter or ask your own question.
        </p>
      </div>
      <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {suggestedPrompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            disabled={disabled}
            className="rounded-lg border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  userInitial,
  streaming,
}: {
  message: AssistantMessage;
  userInitial: string;
  streaming: boolean;
}) {
  const isUser = message.role === "user";
  const isEmptyAssistant = !isUser && message.content.length === 0;

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isUser
            ? "bg-muted text-muted-foreground text-xs font-medium"
            : "bg-primary/10 text-primary",
        )}
      >
        {isUser ? userInitial : <Bot className="size-4" />}
      </div>
      <div
        className={cn(
          "min-w-0 max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {isEmptyAssistant ? (
          <ThinkingDots />
        ) : (
          <p className="whitespace-pre-wrap break-words">
            {message.content}
            {!isUser && streaming && (
              <span className="ml-0.5 inline-block h-4 w-1.5 -translate-y-px animate-pulse rounded-sm bg-current align-middle" />
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="size-1.5 animate-bounce rounded-full bg-current/60"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}
