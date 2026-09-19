"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import {
  CALENDAR_LINK,
  ChatMessage,
  DEFAULT_ASSISTANT_MESSAGE,
  LeadProfile,
  WHATSAPP_NUMBER,
} from "@/app/lib/open-limits-brain";
import { getBrowserSessionId } from "@/app/lib/browser-session";
import {
  reconcileChatHistory,
  splitAssistantContent,
} from "@/app/lib/chat-content";

type LeadChatProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ChatApiResponse = {
  answer?: string;
  lead?: LeadProfile;
  saved?: boolean;
  sessionId?: string;
  error?: string;
};

type ChatSessionResponse = {
  messages?: ChatMessage[];
};

const starterPrompts = [
  "I need a website, app, or software build",
  "Can you scope my idea and tech stack?",
  "I want an expert quote for my project",
];

function getMetaCookie(name: "_fbp" | "_fbc") {
  return document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1];
}

function AssistantMessageContent({ content }: { content: string }) {
  const {
    paragraphs: bodyLines,
    showCalendar,
    showWhatsapp,
  } = splitAssistantContent(content);

  return (
    <>
      {bodyLines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
      {showCalendar || showWhatsapp ? (
        <div className="lead-chat__ctas">
          {showCalendar ? (
            <a href={CALENDAR_LINK} target="_blank" rel="noreferrer">
              Book a call
            </a>
          ) : null}
          {showWhatsapp ? (
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              Fast-track WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export function LeadChat({ open, onOpenChange }: LeadChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: DEFAULT_ASSISTANT_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [sessionId, setSessionId] = useState(() =>
    typeof window === "undefined" ? "" : getBrowserSessionId(),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const sendingRef = useRef(false);
  const revisionRef = useRef(0);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: isSending ? "instant" : "smooth",
    });
  }, [messages, isSending, open]);

  useEffect(() => {
    const chat = viewportRef.current;
    if (!chat) return;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const viewport = window.visualViewport;
    const scrollY = window.scrollY;
    const body = document.body;
    const previousStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const previousFocus = document.activeElement;
    let frame = 0;
    const syncViewport = () => {
      frame = 0;
      const messages = scrollRef.current;
      const atBottom = messages
        ? messages.scrollHeight - messages.scrollTop - messages.clientHeight < 24
        : false;
      const height = viewport?.height ?? window.innerHeight;
      const offsetTop = viewport?.offsetTop ?? 0;
      chat.style.setProperty("--chat-viewport-height", `${height}px`);
      chat.style.setProperty("--chat-viewport-top", `${offsetTop}px`);
      launcherRef.current?.style.setProperty(
        "--chat-bottom-offset",
        `${Math.max(0, window.innerHeight - height - offsetTop)}px`,
      );
      chat.dataset.compact = String(height < 500);
      if (messages && atBottom) messages.scrollTop = messages.scrollHeight;
    };
    const requestViewport = () => {
      if (!frame) frame = window.requestAnimationFrame(syncViewport);
    };

    // iPhone browser chrome and its keyboard resize the visual viewport separately.
    if (open) {
      body.style.overflow = "hidden";
      if (mobile) {
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = "100%";
      }
    }
    syncViewport();
    viewport?.addEventListener("resize", requestViewport);
    viewport?.addEventListener("scroll", requestViewport);
    window.addEventListener("resize", requestViewport);
    const focusTimer = window.setTimeout(() => {
      if (!open) return;
      // Auto-opening on a phone should not summon the keyboard or pan the page.
      const target = mobile ? panelRef.current : inputRef.current;
      target?.focus({ preventScroll: true });
    }, 120);

    return () => {
      window.clearTimeout(focusTimer);
      window.cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", requestViewport);
      viewport?.removeEventListener("scroll", requestViewport);
      window.removeEventListener("resize", requestViewport);
      if (open) {
        Object.assign(body.style, previousStyles);
        if (mobile) window.scrollTo({ top: scrollY, behavior: "instant" });
        if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
          previousFocus.focus({ preventScroll: true });
        }
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !sessionId || isSending) return;
    const controller = new AbortController();
    let polling = false;

    const poll = async () => {
      if (sendingRef.current || polling) return;
      polling = true;
      const revision = revisionRef.current;
      try {
        const response = await fetch(
          `/api/chat?sessionId=${encodeURIComponent(sessionId)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data = (await response.json()) as ChatSessionResponse;
        if (
          controller.signal.aborted ||
          sendingRef.current ||
          revision !== revisionRef.current
        )
          return;
        if (data.messages?.length) {
          setMessages((current) =>
            reconcileChatHistory(current, data.messages!),
          );
        }
      } finally {
        polling = false;
      }
    };

    const interval = window.setInterval(
      () => void poll().catch(() => undefined),
      4000,
    );
    return () => {
      window.clearInterval(interval);
      controller.abort();
    };
  }, [open, sessionId, isSending]);

  async function sendMessage(value: string) {
    const content = value.trim();
    if (!content || sendingRef.current) return;
    sendingRef.current = true;
    revisionRef.current += 1;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const eventId = crypto.randomUUID();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          page: window.location.pathname,
          sessionId: sessionId || getBrowserSessionId(),
          eventId,
          fbp: getMetaCookie("_fbp"),
          fbc: getMetaCookie("_fbc"),
        }),
      });
      const data = (await response.json()) as ChatApiResponse;
      if (!response.ok || !data.answer?.trim())
        throw new Error(data.error || "No reply received");
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
      if (data.sessionId && data.sessionId !== sessionId)
        setSessionId(data.sessionId);
      if (data.saved) setLeadSaved(true);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "I couldn't get a reply just now. Your question is still here; please try again in a moment.",
        },
      ]);
    } finally {
      sendingRef.current = false;
      revisionRef.current += 1;
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <>
      <button
        ref={launcherRef}
        className="chat-launcher"
        onClick={() => onOpenChange(true)}
        hidden={open}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="open-limits-chat"
      >
        <MessageCircle size={18} aria-hidden="true" />
        <span className="chat-launcher__desktop-label">Let&apos;s talk</span>
        <span className="chat-launcher__mobile-label">Talk to developer</span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </button>

      <div
        ref={viewportRef}
        className={open ? "lead-chat lead-chat--open" : "lead-chat"}
        aria-hidden={!open}
        inert={!open}
        onKeyDown={(event) => {
          if (event.key === "Escape") onOpenChange(false);
          if (event.key !== "Tab") return;
          const controls = panelRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not(:disabled), textarea:not(:disabled)',
          );
          if (!controls?.length) return;
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (
            event.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === panelRef.current)
          ) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <div
          id="open-limits-chat"
          ref={panelRef}
          className="lead-chat__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Open Limits project chat"
          tabIndex={-1}
        >
          <div className="lead-chat__header">
            <div>
              <span>OPEN LIMITS BRAIN</span>
              <h2>Project concierge</h2>
            </div>
            <button onClick={() => onOpenChange(false)} aria-label="Close chat">
              ×
            </button>
          </div>

          <div className="lead-chat__meta">
            <span>Expert scoping</span>
            <span>Web · software · iOS · AI</span>
          </div>

          <div className="lead-chat__messages" ref={scrollRef}>
            {messages.map((message, index) => (
              <div
                className={`lead-chat__bubble lead-chat__bubble--${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.role === "assistant" ? (
                  <AssistantMessageContent content={message.content} />
                ) : (
                  message.content
                )}
              </div>
            ))}
            {isSending ? (
              <div
                className="lead-chat__bubble lead-chat__bubble--assistant lead-chat__bubble--typing"
                role="status"
                aria-label="Assistant is typing"
              >
                <span>Typing</span>
                <span className="lead-chat__typing-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            ) : null}

            {messages.length === 1 ? (
              <div
                className="lead-chat__prompts"
                aria-label="Suggested questions"
              >
                {starterPrompts.map((prompt) => (
                  <button key={prompt} onClick={() => void sendMessage(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {leadSaved ? (
            <div className="lead-chat__saved" role="status">
              Conversation saved.
            </div>
          ) : null}

          <form className="lead-chat__form" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
              placeholder="Ask about your idea, features, or next steps..."
              aria-label="Message to Open Limits"
              enterKeyHint="send"
              rows={2}
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              aria-label="Send message"
            >
              →
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
