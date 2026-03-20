import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Package2, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePartCart } from "@/lib/part-cart-context";

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
  const { isMobile, isMobileOrTablet } = useBreakpoint();
  const { items } = usePartCart();
  const hasCart = isMobileOrTablet && items.length > 0;

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

  /* ── positioning constants ── */
  const NAV_BAR_H  = 64;
  const CART_BAR_H = 52;
  const BTN_GAP    = 12;
  const BTN_SIZE   = 56;

  const baseBottom  = isMobile ? NAV_BAR_H + BTN_GAP : 24;
  const cartOffset  = hasCart ? CART_BAR_H : 0;
  const btnBottom   = isMobile ? baseBottom + cartOffset : 24;
  const btnLeft     = isMobile ? 16 : 24;

  const panelBottom = isMobile
    ? btnBottom + BTN_SIZE + 8
    : btnBottom + BTN_SIZE + 8;

  const panelWidth  = isMobile ? "calc(100vw - 32px)" : "340px";
  const panelHeight = isMobile ? `calc(100dvh - ${panelBottom + 16}px)` : "480px";
  const panelLeft   = isMobile ? 16 : btnLeft;

  return (
    <>
      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="افتح المساعد"
        style={{
          position: "fixed",
          bottom: btnBottom,
          left: btnLeft,
          zIndex: 60,
          width: BTN_SIZE,
          height: BTN_SIZE,
          borderRadius: "50%",
          background: "var(--primary, #1A2356)",
          border: "2.5px solid #C8974A",
          boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          transition: "transform .2s, bottom .3s ease",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
      >
        {open ? <ChevronDown size={24} /> : <MessageCircle size={26} />}
        {!open && (
          <span style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#C8974A",
            animation: "rp-glow-blink 2s infinite",
          }} />
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: panelBottom,
            left: panelLeft,
            zIndex: 59,
            width: panelWidth,
            height: panelHeight,
            maxHeight: isMobile ? `calc(100dvh - ${panelBottom + 8}px)` : "480px",
            borderRadius: isMobile ? 24 : 28,
            background: "#fff",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            border: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ background: "#1A2356", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(200,151,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bot size={20} color="#C8974A" />
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 14, margin: 0, lineHeight: 1.3, fontFamily: "'Almarai',sans-serif" }}>رينو مساعد</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, margin: 0, fontFamily: "'Almarai',sans-serif" }}>متخصص صيانة رينو الإسكندرية</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 12, background: "#F8FAFC" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", gap: 8, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: msg.role === "user" ? "rgba(26,35,86,0.1)" : "rgba(200,151,74,0.2)" }}>
                  {msg.role === "user" ? <User size={14} color="#1A2356" /> : <Bot size={14} color="#C8974A" />}
                </div>
                <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 4, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    padding: "8px 12px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    fontFamily: "'Almarai',sans-serif",
                    direction: "rtl",
                    ...(msg.role === "user"
                      ? { background: "#1A2356", color: "#fff" }
                      : { background: "#fff", color: "#1a2356", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)" }
                    ),
                  }}>
                    {msg.content || (msg.streaming && (
                      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {[0, 150, 300].map(d => (
                          <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(26,35,86,0.35)", animation: `rp-bounce 1.2s ${d}ms infinite` }} />
                        ))}
                      </span>
                    ))}
                    {msg.streaming && msg.content && (
                      <span style={{ display: "inline-block", width: 2, height: 14, background: "rgba(26,35,86,0.4)", animation: "rp-glow-blink 1s infinite", marginLeft: 2, verticalAlign: "middle" }} />
                    )}
                  </div>
                  {!msg.streaming && msg.suggestedPackageId && msg.suggestedPackageName && (
                    <Link
                      href={`/checkout/${msg.suggestedPackageId}`}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "#C8974A", color: "#1A2356", fontSize: 12, fontWeight: 800, padding: "6px 14px", borderRadius: 999, textDecoration: "none", fontFamily: "'Almarai',sans-serif" }}
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

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(0,0,0,0.07)", background: "#fff", display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك..."
              disabled={isStreaming}
              dir="rtl"
              style={{
                flex: 1,
                background: "#F1F5F9",
                border: "1.5px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                padding: "9px 14px",
                fontSize: 13,
                outline: "none",
                fontFamily: "'Almarai',sans-serif",
                direction: "rtl",
                color: "#1a2356",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: !input.trim() || isStreaming ? "#e2e8f0" : "#1A2356",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: !input.trim() || isStreaming ? "not-allowed" : "pointer",
                flexShrink: 0,
                transition: "background .2s",
              }}
            >
              <Send size={16} color={!input.trim() || isStreaming ? "#94a3b8" : "#C8974A"} style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
