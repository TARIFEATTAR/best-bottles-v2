import React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  role: "user" | "model";
  text: string;
}

interface ConciergeDrawerProps {
  isOpen: boolean;
  isCollapsed?: boolean;
  onClose: () => void;
  onCollapse?: () => void;
  onExpand?: () => void;
  messages: Message[];
  isLoading: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  onSend: (overrideText?: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  avatarSlot: React.ReactNode;
}

const quickActions = [
  { label: "Track Order", query: "Can you help me track my order?" },
  { label: "Shipping", query: "What are the current shipping lead times?" },
  { label: "Check Stock", query: "Are your 9ml roll-on bottles in stock?" },
];

export const ConciergeDrawer: React.FC<ConciergeDrawerProps> = ({
  isOpen,
  isCollapsed = false,
  onClose,
  onCollapse,
  onExpand,
  messages,
  isLoading,
  inputText,
  setInputText,
  onSend,
  onKeyPress,
  inputRef,
  messagesEndRef,
  avatarSlot,
}) => {
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <div
        className={`
          fixed z-[100] flex flex-col bg-white dark:bg-[#111111] shadow-2xl
          transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
          inset-0
          ${isOpen ? "translate-y-0" : "translate-y-full"}
          ${isCollapsed ? "!h-[72px] md:!h-[72px] md:!max-h-[72px]" : ""}
          md:top-0 md:right-0 md:bottom-auto md:left-auto md:h-full md:w-[420px]
          md:border-l md:border-gray-200 md:dark:border-white/10
          md:${isOpen ? "translate-x-0 translate-y-0" : "translate-x-full translate-y-0"}
        `}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1D1D1F] border-b border-white/5 shrink-0 safe-top">
          <div>
            <h2 className="text-white font-serif font-bold text-base tracking-wide">
              Concierge
            </h2>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">
              Best Bottles AI
            </p>
          </div>
          <div className="flex items-center gap-1">
            {onCollapse && onExpand && (
              <button
                onClick={isCollapsed ? onExpand : onCollapse}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                aria-label={isCollapsed ? "Expand" : "Minimize"}
              >
                <span className="material-symbols-outlined text-xl">
                  {isCollapsed ? "expand_more" : "expand_less"}
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* ── Avatar strip ── */}
        {!isCollapsed && avatarSlot}

        {/* ── Messages ── */}
        {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#FAFAF9] dark:bg-[#161616]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "model" && (
                <div className="w-6 h-6 rounded-full bg-[#1D1D1F] text-[#C5A065] flex items-center justify-center text-[10px] mr-2 mt-1 shrink-0">
                  <span className="material-symbols-outlined text-xs">
                    person
                  </span>
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#1D1D1F] text-white rounded-tr-sm shadow-sm"
                    : "bg-white dark:bg-[#1E1E1E] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-[#1D1D1F] text-[#C5A065] flex items-center justify-center text-[10px] mr-2 mt-1 shrink-0">
                <span className="material-symbols-outlined text-xs">person</span>
              </div>
              <div className="bg-white dark:bg-[#1E1E1E] px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-800 shadow-sm flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A065] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A065] animate-bounce [animation-delay:100ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A065] animate-bounce [animation-delay:200ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        )}

        {/* ── Footer: Quick Actions + Input ── */}
        {!isCollapsed && (
        <div className="px-4 pt-3 pb-4 bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-gray-800 shrink-0 safe-bottom">
          {/* Quick actions */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => onSend(action.query)}
                className="whitespace-nowrap px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-full text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:border-[#C5A065] hover:text-[#C5A065] transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Cost hint: text is free, Talk loads avatar */}
          <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center pb-1">
            Text chat is free. Use Talk for voice & video.
          </p>

          {/* Input row */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 focus-within:border-[#C5A065] focus-within:ring-1 focus-within:ring-[#C5A065]/40 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400"
            />

            <button
              onClick={() => onSend()}
              disabled={isLoading || !inputText.trim()}
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                inputText.trim()
                  ? "text-white bg-[#C5A065] shadow-sm hover:bg-[#b8914f]"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                arrow_upward
              </span>
            </button>
          </div>
        </div>
        )}
      </div>
    </>
  );
};
