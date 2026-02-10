/**
 * TavusAvatar — Minimal replica-only video display.
 * Shows Grace's face with lip-synced audio. No user camera, no call controls.
 * Uses Daily React SDK directly for full control over the rendering.
 */
import React, { useEffect, useCallback } from "react";
import {
  DailyProvider,
  DailyVideo,
  DailyAudioTrack,
  useDaily,
  useParticipantIds,
  useMeetingState,
} from "@daily-co/daily-react";

// ─── Inner component (must be inside DailyProvider) ────────────────
interface AvatarInnerProps {
  conversationUrl: string;
  onReady?: () => void;
  onLeave?: () => void;
  onError?: (msg: string) => void;
}

const AvatarInner: React.FC<AvatarInnerProps> = ({
  conversationUrl,
  onReady,
  onLeave,
  onError,
}) => {
  const daily = useDaily();
  const meetingState = useMeetingState();

  // Find the Tavus replica participant
  const replicaIds = useParticipantIds({
    filter: (p) => p.user_id.includes("tavus-replica"),
  });
  const replicaId = replicaIds[0];

  // Join the call with mic only (no camera)
  useEffect(() => {
    if (!daily || !conversationUrl) return;

    daily
      .join({
        url: conversationUrl,
        // Start with mic on, camera OFF
        startVideoOff: true,
        startAudioOff: false,
        inputSettings: {
          audio: {
            processor: { type: "noise-cancellation" },
          },
        },
      })
      .catch((err) => {
        console.error("Tavus join failed:", err);
        onError?.(err?.message || "Failed to join conversation");
      });

    return () => {
      daily.leave().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daily, conversationUrl]);

  // Track meeting state
  useEffect(() => {
    if (meetingState === "joined-meeting" && replicaId) {
      onReady?.();
    }
    if (meetingState === "left-meeting" || meetingState === "error") {
      onLeave?.();
    }
  }, [meetingState, replicaId, onReady, onLeave]);

  // Handle errors
  useEffect(() => {
    if (meetingState === "error") {
      onError?.("Connection lost");
    }
  }, [meetingState, onError]);

  // Toggle mic from outside
  const toggleMic = useCallback(() => {
    if (!daily) return;
    const local = daily.participants()?.local;
    if (local?.audio) {
      daily.setLocalAudio(!local.audio);
    }
  }, [daily]);

  // Expose toggle via ref-like pattern
  useEffect(() => {
    (window as Record<string, unknown>).__tavusToggleMic = toggleMic;
    return () => {
      delete (window as Record<string, unknown>).__tavusToggleMic;
    };
  }, [toggleMic]);

  if (!replicaId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#C5A065] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-[9px] uppercase tracking-widest">
            Connecting to Grace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black">
      {/* Replica video — fills the container */}
      <DailyVideo
        sessionId={replicaId}
        type="video"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {/* Replica audio — plays Grace's voice */}
      <DailyAudioTrack sessionId={replicaId} />
    </div>
  );
};

// ─── Public wrapper (provides DailyProvider) ───────────────────────
interface TavusAvatarProps {
  conversationUrl: string;
  onReady?: () => void;
  onLeave?: () => void;
  onError?: (msg: string) => void;
}

export const TavusAvatar: React.FC<TavusAvatarProps> = (props) => {
  return (
    <DailyProvider>
      <AvatarInner {...props} />
    </DailyProvider>
  );
};
