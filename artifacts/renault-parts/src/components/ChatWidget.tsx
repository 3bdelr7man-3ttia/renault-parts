import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Package2, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedPackageSlug?: string | null;
  suggestedPackageName?: string | null;
  suggestedPackageId?: number | null;
  streaming?: boolean;
};

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "أهلاً! أنا رينو مساعد 🔧\nسأساعدك تختار باكدج الصيانة المناسب لسيارتك.\n\nأخبرني: إيه موديل سيارتك وكام كيلومتر عداد؟",
};

const CHAT_URL = `${import.meta.env.BASE_URL}api/chat`.replace(/\/\//g, "/");

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const botMsgId = crypto.randomUUID();
    const botMsg: Message = { id: botMsgId, role: "assistant", content: "", streaming: true };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const authHeaders = getAuthHeaders();
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders.headers ?? {}),
        },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let doneMeta: { sessionId?: string; suggestedPackageSlug?: string | null; suggestedPackageName?: string | null; suggestedPackageId?: number | null } = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          let evt: { content?: string; done?: boolean; sessionId?: string; suggestedPackageSlug?: string | null; suggestedPackageName?: string | null; suggestedPackageId?: number | null };
          try { evt = JSON.parse(jsonStr); } catch { continue; }

          if (evt.content) {
            fullContent += evt.content;
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, content: fullContent } : m))
            );
          }

          if (evt.done) {
            doneMeta = { sessionId: evt.sessionId, suggestedPackageSlug: evt.suggestedPackageSlug, suggestedPackageName: evt.suggestedPackageName, suggestedPackageId: evt.suggestedPackageId };
          }
        }
      }

      const cleanContent = fullContent.replace(/\[PACKAGE_SLUG:[^\]]+\]/g, "").trim();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                content: cleanContent,
                streaming: false,
                suggestedPackageSlug: doneMeta.suggestedPackageSlug ?? null,
                suggestedPackageName: doneMeta.suggestedPackageName ?? null,
                suggestedPackageId: doneMeta.suggestedPackageId ?? null,
              }
            : m
        )
      );

      if (doneMeta.sessionId) setSessionId(doneMeta.sessionId);
    } catch (err) {
      console.error("Chat stream error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId ? { ...m, content: "حدث خطأ. حاول مرة أخرى.", streaming: false } : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary shadow-xl flex items-center justify-center text-white border-2 border-accent hover:scale-110 transition-transform"
        aria-label="افتح المساعد"
      >
        {open ? <ChevronDown size={24} /> : <MessageCircle size={26} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-24 left-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border"
          style={{ height: "480px" }}
        >
          <div className="bg-primary px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
                <Bot size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">رينو مساعد</p>
                <p className="text-white/60 text-xs">متخصص صيانة رينو الإسكندرية</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-primary/10" : "bg-accent/20"}`}
                >
                  {msg.role === "user" ? (
                    <User size={14} className="text-primary" />
                  ) : (
                    <Bot size={14} className="text-accent" />
                  )}
                </div>
                <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-white text-foreground shadow-sm border border-border/50 rounded-tl-sm"
                    }`}
                  >
                    {msg.content || (msg.streaming && (
                      <span className="flex gap-1 items-center py-0.5">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:300ms]" />
                      </span>
                    ))}
                    {msg.streaming && msg.content && (
                      <span className="inline-block w-0.5 h-3.5 bg-primary/50 animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                  {!msg.streaming && msg.suggestedPackageId && msg.suggestedPackageName && (
                    <Link
                      href={`/checkout/${msg.suggestedPackageId}`}
                      className="flex items-center gap-1.5 bg-accent text-primary text-xs font-bold px-3 py-1.5 rounded-full hover:bg-accent/80 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <Package2 size={12} />
                      اطلب الآن: {msg.suggestedPackageName}
                    </Link>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-border bg-white flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك..."
              disabled={isStreaming}
              className="flex-1 bg-slate-50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-right"
              dir="rtl"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Send size={16} className="rotate-180" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
