import React, { lazy, Suspense } from "react";
import { motion } from "framer-motion";

// Lazy-load the Tavus avatar component
const TavusAvatar = lazy(() =>
  import("./TavusAvatar").then((m) => ({ default: m.TavusAvatar }))
);

// Rose (Grace) stock replica image for idle state
const ROSE_IMAGE_URL =
  "https://mintcdn.com/tavus/_cI_e0wGUkj7b2SY/images/stock-replica/rose.png?fit=max&auto=format&n=_cI_e0wGUkj7b2SY&q=85&s=2be4bb707bd4e1cadaa90b3900ea368f";

interface ConciergeLaunchersProps {
  isOpen: boolean;
  isGraceListening: boolean;
  avatarStatus: string;
  avatarError: string;
  conversationUrl: string | null;
  onTavusLeave: () => void;
  onTavusReady: () => void;
  onOpen: () => void;
  onToggleVoice: () => void;
}

export const ConciergeLaunchers: React.FC<ConciergeLaunchersProps> = ({
  isOpen,
  isGraceListening,
  avatarStatus,
  avatarError,
  conversationUrl,
  onTavusLeave,
  onTavusReady,
  onOpen,
  onToggleVoice,
}) => {
  const isLive = avatarStatus === "ready" && !!conversationUrl;
  const isConnecting = avatarStatus === "connecting";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: isOpen ? 0 : 1,
        y: isOpen ? 20 : 0,
        scale: isOpen ? 0.95 : 1,
        pointerEvents: isOpen ? ("none" as const) : ("auto" as const),
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-[80] flex flex-col items-center gap-2"
    >
      {/* Grace avatar card — brand-aligned, visible on light backgrounds */}
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("button")) onOpen();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!(e.target as HTMLElement).closest("button")) onOpen();
          }
        }}
        className="relative w-[200px] rounded-2xl overflow-hidden bg-[#1D1D1F] border border-[#C5A065]/30 shadow-[0_8px_32px_rgba(0,0,0,0.25),0_0_0_1px_rgba(197,160,101,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(197,160,101,0.15)] transition-shadow duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5A065]/50 focus:ring-offset-2 focus:ring-offset-[#1D1D1F]"
      >
        {/* Video area */}
        <div className="w-full aspect-[3/4] bg-black relative overflow-hidden">
          {/* Tavus avatar (Grace's face only — no user camera) */}
          {conversationUrl && (
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="w-5 h-5 border-2 border-[#C5A065] border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <div className="absolute inset-0">
                <TavusAvatar
                  conversationUrl={conversationUrl}
                  onReady={onTavusReady}
                  onLeave={onTavusLeave}
                  onError={(msg) => console.error("Tavus error:", msg)}
                />
              </div>
            </Suspense>
          )}

          {/* Connecting overlay */}
          {isConnecting && !isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 z-10">
              <div className="w-5 h-5 border-2 border-[#C5A065] border-t-transparent rounded-full animate-spin" />
              {avatarError && (
                <p className="text-white/50 text-[8px] text-center px-2 leading-tight">
                  {avatarError}
                </p>
              )}
            </div>
          )}

          {/* Error state */}
          {avatarStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#2a2a2c] to-[#1a1a1c] z-10">
              <span className="material-symbols-outlined text-rose-400/60 text-lg">
                error_outline
              </span>
              <p className="text-white/40 text-[8px] text-center px-2 leading-tight">
                {avatarError || "Connection failed"}
              </p>
            </div>
          )}

          {/* Idle state — Rose (Grace) stock replica image */}
          {avatarStatus === "idle" && !conversationUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-end">
              <img
                src={ROSE_IMAGE_URL}
                alt="Grace - Concierge"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <p className="relative z-10 text-white/90 text-[8px] font-medium uppercase tracking-[0.25em] animate-pulse mb-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Tap to chat
              </p>
            </div>
          )}

          {/* Status dot */}
          <span
            className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-black/30 z-20 ${
              isLive
                ? "bg-green-500"
                : isConnecting
                  ? "bg-amber-400 animate-pulse"
                  : "bg-gray-500"
            }`}
          />

          {/* Name badge */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8 z-20">
            <p className="text-white text-[11px] font-semibold tracking-wide">
              Grace
            </p>
            <p className="text-white/40 text-[8px] uppercase tracking-[0.15em]">
              Concierge
            </p>
          </div>

          {/* Listening bars overlay */}
          {isGraceListening && (
            <div className="absolute top-2 left-2 flex items-center gap-[2px] z-20">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-[2px] bg-[#C5A065] rounded-full animate-pulse"
                  style={{
                    height: `${5 + (i % 3) * 3}px`,
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Split action bar: Chat | Talk */}
        <div className="flex w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="flex-1 py-2 flex items-center justify-center gap-1 transition-all text-[9px] font-bold uppercase tracking-widest bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border-r border-white/8"
          >
            <span className="material-symbols-outlined text-xs">
              chat_bubble
            </span>
            Chat
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVoice();
            }}
            className={`flex-1 py-2 flex items-center justify-center gap-1 transition-all text-[9px] font-bold uppercase tracking-widest ${
              isGraceListening
                ? "bg-[#C5A065]/20 text-[#C5A065]"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            <span
              className={`material-symbols-outlined text-xs ${isGraceListening ? "animate-pulse" : ""}`}
            >
              {isGraceListening ? "graphic_eq" : "mic"}
            </span>
            {isGraceListening ? "Live" : "Talk"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
