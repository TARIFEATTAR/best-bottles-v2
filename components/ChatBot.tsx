import React, { useState, useRef, useEffect, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS, FAQ_DATA } from "../constants";

import { ConciergeLaunchers } from "./concierge/ConciergeLaunchers";
import { GraceMiniAvatar } from "./concierge/GraceMiniAvatar";
import { ConciergeDrawer } from "./concierge/ConciergeDrawer";

// ─── Types ──────────────────────────────────────────────────────────
interface Message {
  role: "user" | "model";
  text: string;
}

type OpenMode = "chat" | "grace" | null;

// ─── Tavus config ───────────────────────────────────────────────────
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY as string;
const TAVUS_REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID as string;
const TAVUS_PERSONA_ID = import.meta.env.VITE_TAVUS_PERSONA_ID as string;

// ─── Component ──────────────────────────────────────────────────────
export const ChatBot: React.FC = () => {
  // ── Drawer state ──
  const [openMode, setOpenMode] = useState<OpenMode>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isOpen = openMode !== null;

  // ── Messages ──
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Welcome to Best Bottles. I can assist with product selection, custom specifications, or order inquiries. How may I help you today?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Tavus state ──
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [isGraceListening, setIsGraceListening] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<
    "idle" | "connecting" | "ready" | "error"
  >("idle");
  const [avatarError, setAvatarError] = useState("");
  const conversationIdRef = useRef<string | null>(null);

  // ── Create Tavus conversation ──
  const startTavusConversation = useCallback(async () => {
    if (!TAVUS_API_KEY) {
      setAvatarStatus("error");
      setAvatarError("Missing VITE_TAVUS_API_KEY");
      return;
    }

    try {
      setAvatarStatus("connecting");
      setAvatarError("");

      const body: Record<string, unknown> = {
        properties: {
          // Use Tavus default background (no green screen)
          apply_greenscreen: false,
        },
      };
      if (TAVUS_REPLICA_ID) body.replica_id = TAVUS_REPLICA_ID;
      if (TAVUS_PERSONA_ID) body.persona_id = TAVUS_PERSONA_ID;

      const response = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TAVUS_API_KEY,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Tavus API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      conversationIdRef.current = data.conversation_id || null;
      setConversationUrl(data.conversation_url);
      // Status stays "connecting" until TavusAvatar calls onTavusReady
    } catch (error) {
      console.error("Tavus conversation failed:", error);
      setAvatarStatus("error");
      setAvatarError(
        error instanceof Error ? error.message : String(error)
      );
    }
  }, []);

  // ── End Tavus conversation ──
  const endTavusConversation = useCallback(async () => {
    const convId = conversationIdRef.current;
    if (convId && TAVUS_API_KEY) {
      try {
        await fetch(`https://tavusapi.com/v2/conversations/${convId}/end`, {
          method: "POST",
          headers: { "x-api-key": TAVUS_API_KEY },
        });
      } catch {
        // best-effort cleanup
      }
    }
    conversationIdRef.current = null;
    setConversationUrl(null);
    setIsGraceListening(false);
    setAvatarStatus("idle");
    setAvatarError("");
  }, []);

  // ── Voice toggle (start/stop Tavus) ──
  const handleToggleVoice = useCallback(async () => {
    if (isGraceListening || conversationUrl) {
      await endTavusConversation();
    } else {
      await startTavusConversation();
    }
  }, [
    isGraceListening,
    conversationUrl,
    startTavusConversation,
    endTavusConversation,
  ]);

  // ── Tavus leave handler ──
  const handleTavusLeave = useCallback(() => {
    conversationIdRef.current = null;
    setConversationUrl(null);
    setIsGraceListening(false);
    setAvatarStatus("idle");
  }, []);

  // ── Scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // ── Listen for nav bar "Talk With Grace" click ──
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ startVoice?: boolean }>;
      setOpenMode("chat");
      if (ev.detail?.startVoice) {
        void startTavusConversation();
      }
    };
    window.addEventListener("open-grace-chat", handler);
    return () => window.removeEventListener("open-grace-chat", handler);
  }, [startTavusConversation]);

  // ── Focus input when opened in chat mode ──
  useEffect(() => {
    if (openMode === "chat" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [openMode]);

  // ── Auto-start Tavus when opened in grace mode ──
  useEffect(() => {
    if (openMode === "grace" && !isGraceListening && TAVUS_API_KEY) {
      void startTavusConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMode]);

  // ── Text chat (Gemini) ──
  const handleSendMessage = async (overrideText?: string) => {
    const textToUse = overrideText || inputText;
    if (!textToUse.trim() || isLoading) return;

    if (!overrideText) setInputText("");
    setMessages((prev) => [...prev, { role: "user", text: textToUse }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
      });

      const productContext = PRODUCTS.map(
        (p) =>
          `- ${p.name} (SKU: ${p.sku}): ${p.description}. Price: ${p.price}. Capacity: ${p.capacity}. Color: ${p.color}. Category: ${p.category}.`
      ).join("\n");

      const faqContext = FAQ_DATA.map(
        (cat) =>
          `CATEGORY: ${cat.category}\n` +
          cat.items
            .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
            .join("\n")
      ).join("\n\n");

      const systemInstruction = `You are the "Concierge" AI for Best Bottles, a premium B2B packaging supplier specializing in high-quality glass bottles, vials, and closures for the fragrance and cosmetic industries.
Your goal is to assist business owners, perfumers, and brand managers in finding the perfect packaging solutions, while also handling general customer service inquiries.

Business Context:
- We primarily serve B2B clients (wholesalers, manufacturers, retailers) but accommodate sample orders.
- We specialize in "Muted Luxury" aesthetics and sustainable packaging.
- Our showroom and headquarters are located at: 34135 7th St, Union City, CA 94587.
- Customer Service Hours: Monday to Friday, 9:30am to 5:30pm PST.
- Contact: (800) 936-3628 or sales@nematinternational.com.

Catalog:
${productContext}

FAQ:
${faqContext}

Guidelines:
1. Tone: Professional, knowledgeable, helpful. Luxury Concierge persona.
2. Product Recommendations: Prioritize exact catalog matches. If none, suggest closest alternative or Custom Molding.
3. B2B: Tiered pricing for 100, 500, 1000+ units. Contract packaging for 100-5000 units.
4. Technical: Explain terms clearly (e.g., "18-400 neck finish", "Type III flint glass").
5. Policy: Refer strictly to FAQ context for shipping, returns, breakage. Minimum order $50.
6. Hours: M-F 9:30-5:30 PST. Outside hours, suggest email.
7. Formatting: NEVER use markdown. Plain text only. No asterisks, hash signs, or bolding.`;

      const chat = ai.chats.create({
        model: "gemini-3-pro-preview",
        config: { systemInstruction },
        history: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
      });

      const response = await chat.sendMessage({ message: textToUse });
      if (response.text) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: response.text || "I'm having trouble finding that.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I apologize, but I'm having trouble connecting right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleClose = () => {
    setOpenMode(null);
    setIsCollapsed(false);
  };

  const handleCollapse = () => setIsCollapsed(true);
  const handleExpand = () => setIsCollapsed(false);

  // ── Render ──
  return (
    <>
      {/* Floating Grace card + chat button */}
      <ConciergeLaunchers
        isOpen={isOpen}
        isGraceListening={isGraceListening}
        avatarStatus={avatarStatus}
        avatarError={avatarError}
        conversationUrl={conversationUrl}
        onTavusLeave={handleTavusLeave}
        onTavusReady={() => {
          setAvatarStatus("ready");
          setIsGraceListening(true);
        }}
        onOpen={() => setOpenMode("chat")}
        onToggleVoice={handleToggleVoice}
      />

      {/* Full drawer */}
      <ConciergeDrawer
        isOpen={isOpen}
        isCollapsed={isCollapsed}
        onClose={handleClose}
        onCollapse={handleCollapse}
        onExpand={handleExpand}
        messages={messages}
        isLoading={isLoading}
        inputText={inputText}
        setInputText={setInputText}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        inputRef={inputRef}
        messagesEndRef={messagesEndRef}
        avatarSlot={
          <GraceMiniAvatar
            avatarStatus={avatarStatus}
            isGraceListening={isGraceListening}
            onToggleVoice={handleToggleVoice}
          />
        }
      />
    </>
  );
};
