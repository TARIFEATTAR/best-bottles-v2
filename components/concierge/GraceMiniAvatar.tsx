import React from "react";

interface GraceMiniAvatarProps {
  avatarStatus: string;
  isGraceListening: boolean;
  onToggleVoice: () => void;
}

export const GraceMiniAvatar: React.FC<GraceMiniAvatarProps> = ({
  avatarStatus,
  isGraceListening,
  onToggleVoice,
}) => {
  const statusDot =
    avatarStatus === "ready"
      ? "bg-green-500"
      : avatarStatus === "connecting"
        ? "bg-amber-400 animate-pulse"
        : avatarStatus === "error" || avatarStatus === "rate-limited"
          ? "bg-rose-400"
          : "bg-gray-400";

  const statusLabel =
    avatarStatus === "ready" && isGraceListening
      ? "Synced"
      : avatarStatus === "ready"
        ? "Connected"
        : avatarStatus === "connecting"
          ? "Connecting..."
          : "Offline";

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#1D1D1F] border-b border-white/5">
      {/* Avatar indicator */}
      <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#C5A065]/25 to-[#C5A065]/10 border border-white/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[#C5A065] text-lg">person</span>
        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1D1D1F] ${statusDot}`} />
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-serif font-semibold text-sm tracking-wide">Grace</p>
        <p className="text-white/40 text-[9px] uppercase tracking-widest mt-0.5">{statusLabel}</p>
      </div>

      {/* Mic toggle */}
      <button
        onClick={onToggleVoice}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
          isGraceListening
            ? "bg-[#C5A065] text-[#1D1D1F]"
            : "bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/70"
        }`}
        aria-label={isGraceListening ? "Stop voice" : "Start voice"}
      >
        <span className={`material-symbols-outlined text-sm ${isGraceListening ? "animate-pulse" : ""}`}>
          {isGraceListening ? "graphic_eq" : "mic"}
        </span>
      </button>
    </div>
  );
};
