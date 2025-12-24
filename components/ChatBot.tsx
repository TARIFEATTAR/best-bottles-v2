import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS, FAQ_DATA } from "../constants";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Welcome to Best Bottles Concierge. I can assist with product selection, custom specifications, or order inquiries. How may I help you today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ElevenLabs Voice State
  const [isGraceListening, setIsGraceListening] = useState(false);
  const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string;

  const conversation = useConversation({
    onConnect: () => setIsGraceListening(true),
    onDisconnect: () => setIsGraceListening(false),
    onError: (err) => {
      console.error("Grace Voice Error:", err);
      setIsGraceListening(false);
    }
  });

  const handleStartGrace = async () => {
    if (isGraceListening) {
      await conversation.endSession();
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await conversation.startSession({ agentId: ELEVENLABS_AGENT_ID } as any);
    } catch (err) {
      console.error("Failed to start voice:", err);
      alert("Microphone access is required for voice chat.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (overrideText?: string) => {
    const textToUse = overrideText || inputText;
    if (!textToUse.trim() || isLoading) return;

    const userMessage = textToUse;
    if (!overrideText) setInputText("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY });

      const productContext = PRODUCTS.map(p =>
        `- ${p.name} (SKU: ${p.sku}): ${p.description}. Price: ${p.price}. Capacity: ${p.capacity}. Color: ${p.color}. Category: ${p.category}.`
      ).join('\n');

      const faqContext = FAQ_DATA.map(cat =>
        `CATEGORY: ${cat.category}\n` +
        cat.items.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n')
      ).join('\n\n');

      const systemInstruction = `You are the "Concierge" AI for Best Bottles, a premium B2B packaging supplier specializing in high-quality glass bottles, vials, and closures for the fragrance and cosmetic industries.
      Your goal is to assist business owners, perfumers, and brand managers in finding the perfect packaging solutions, while also handling general customer service inquiries.

      **Business Context:**
      - We primarily serve B2B clients (wholesalers, manufacturers, retailers) but accommodate sample orders.
      - We specialize in "Muted Luxury" aesthetics and sustainable packaging.
      - Our showroom and headquarters are located at: 34135 7th St, Union City, CA 94587.
      - Customer Service Hours: Monday – Friday, 9:30am to 5:30pm PST.
      - Contact: (800) 936-3628 or sales@nematinternational.com.

      **Catalog & Policy Data:**
      Here is our current product catalog (static database):
      ${productContext}

      **Live Availability (Shopify Integration):**
      We have now enabled live synchronization with our Shopify Studio Catalog. If a customer asks about "Live Products" or "Most Recent Additions", you can inform them that we are synced in real-time with the production database.

      Here is our FAQ / Policy Information (refer to this for shipping, returns, and fees):
      ${faqContext}
      
      **Guidelines:**
      1. **Tone:** Professional, knowledgeable, and helpful. Adopt a "Luxury Concierge" persona.
      2. **Product Recommendations:** When a user asks for a specific bottle (e.g., "blue glass" or "10ml"), prioritize recommending exact matches from the catalog. If no exact match exists, suggest the closest alternative or mention our "Custom Molding" services for bespoke needs.
      3. **B2B Expertise:** If a user asks about bulk pricing, remind them that tiered pricing is available (e.g., 100, 500, 1000+ units) and applied automatically in the cart. Mention we offer contract packaging (filling/labeling) for runs of 100-5000 units.
      4. **Technical Accuracy:** Explain technical terms clearly if needed (e.g., "18-400 neck finish", "Type III flint glass").
      5. **Policy Strictness:** For shipping, returns, breakage, or minimum orders (The minimum order requirement is $50.00), refer strictly to the FAQ context. Do not invent policies.
      6. **Availability:** If asked about live support outside of business hours (M-F 9:30-5:30 PST), kindly inform them of our hours and suggest leaving an email.
      7. **Shopify Live Catalog:** Mention that customers can view the "Live Studio Collection" section on the Home or Collections page for real-time stock and performance metrics.
      8. **Formatting & Output:** NEVER use markdown formatting (no asterisks, hash signs, markdown lists, or bolding). Provide only clean, plain text. Use standard capitalization and punctuation. Use plain text bullet points (e.g., "- item") if necessary, but keep the overall output as "raw" clean text.

      `;

      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: systemInstruction,
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: userMessage });
      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm having trouble finding that." }]);
      }
    } catch (error) {
      console.error("Error communicating with Gemini:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const quickActions = [
    { label: "Track My Order", query: "Can you help me track my order?" },
    { label: "Shipping Updates", query: "What are the current shipping lead times?" },
    { label: "Logistics Inquiry", query: "I have a question about shipping logistics." },
    { label: "Check Stock", query: "Are your 9ml roll-on bottles in stock?" },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`
            fixed z-[100] flex flex-col bg-white dark:bg-[#111111] shadow-2xl transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
            inset-0 
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
            md:top-0 md:right-0 md:bottom-auto md:left-auto md:h-full md:w-[450px] md:border-l md:border-gray-100 md:dark:border-gray-800
            md:${isOpen ? 'translate-x-0 translate-y-0' : 'translate-x-full translate-y-0'}
        `}
      >
        {/* Main Header */}
        <div className="bg-[#1D1D1F] p-5 shrink-0 safe-top border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-[#C5A065] text-xl">sanitizer</span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1D1D1F] rounded-full"></span>
              </div>
              <div>
                <h3 className="text-white font-serif font-bold text-lg tracking-wide">Concierge</h3>
                <p className="text-white/60 text-[10px] uppercase tracking-widest leading-none">Available Now</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>

          {/* Secondary Stats/Info Bar */}
          <div className="flex items-center divide-x divide-white/10 mt-1 border border-white/10 rounded-xl overflow-hidden bg-white/5">
            <button
              onClick={handleStartGrace}
              className={`flex-1 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-all ${isGraceListening ? 'bg-[#C5A065]/20 text-[#C5A065]' : 'text-white/60'}`}
            >
              <span className={`material-symbols-outlined text-sm ${isGraceListening ? 'animate-pulse' : ''}`}>
                {isGraceListening ? 'graphic_eq' : 'mic'}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest">{isGraceListening ? 'Listening' : 'Talk Only'}</span>
            </button>
            <div className="flex-1 py-3 flex items-center justify-center gap-2 text-white/60 px-2 group">
              <span className="material-symbols-outlined text-sm text-[#C5A065] group-hover:scale-110 transition-transform">schedule</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">24/7 Expert AI</span>
            </div>
            <div className="flex-1 py-3 flex items-center justify-center gap-2 text-white/60 px-2 group">
              <span className="material-symbols-outlined text-sm text-[#C5A065] group-hover:scale-110 transition-transform">verified_user</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">B2B Specialist</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9F8F6] dark:bg-[#161616]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-full bg-[#1D1D1F] text-[#C5A065] flex items-center justify-center text-[10px] mr-2 mt-1 shrink-0">
                  <span className="material-symbols-outlined text-xs">sanitizer</span>
                </div>
              )}
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-[#1D1D1F] text-white rounded-tr-sm shadow-md'
                  : 'bg-white dark:bg-[#1E1E1E] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-tl-sm shadow-sm'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-6 h-6 rounded-full bg-[#1D1D1F] text-[#C5A065] flex items-center justify-center text-[10px] mr-2 mt-1 shrink-0">
                <span className="material-symbols-outlined text-xs">sanitizer</span>
              </div>
              <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-800 shadow-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A065] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A065] animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A065] animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Quick Actions */}
        <div className="p-4 bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-gray-800 shrink-0 safe-bottom">

          {/* Prefix Chips / Quick Actions */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(action.query)}
                className="whitespace-nowrap px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:border-[#C5A065] hover:text-[#C5A065] hover:bg-white transition-all shadow-sm"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1E1E1E] rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-[#C5A065] focus-within:ring-1 focus-within:ring-[#C5A065] transition-all relative overflow-hidden">
            {isGraceListening && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className="absolute inset-0 bg-[#C5A059]/10 pointer-events-none"
              />
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isGraceListening ? "Grace is listening to you..." : "Type a message..."}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 z-10"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className={`p-2 rounded-full transition-all z-10 ${inputText.trim() ? 'text-[#C5A065] bg-[#1D1D1F] scale-110' : 'text-gray-400'}`}
            >
              <span className="material-symbols-outlined text-lg">arrow_upward</span>
            </button>
          </div>
          <div className="text-center mt-3">
            <span className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1">
              Best Bottles AI Agent
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className={`hidden md:flex fixed bottom-10 right-0 z-[80] bg-[#1D1D1F]/80 backdrop-blur-md border border-white/10 text-white py-6 px-3 rounded-l-xl shadow-2xl flex-col items-center gap-4 transition-transform duration-300 hover:bg-[#C5A065] hover:text-[#1D1D1F] group ${isOpen ? 'translate-x-[120%]' : 'translate-x-0'}`}
        aria-label="Open Concierge"
      >
        <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">sanitizer</span>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.25em] whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          Concierge
        </span>
      </button>

      <button
        onClick={() => setIsOpen(true)}
        className={`md:hidden fixed bottom-12 right-6 z-[80] w-14 h-14 rounded-full bg-[#1D1D1F]/70 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open Chat"
      >
        <span className="material-symbols-outlined text-2xl">chat_bubble</span>
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#C5A065] border-2 border-[#1D1D1F] rounded-full"></span>
      </button>
    </>
  );
};