"use client";

import { useState } from "react";
import { Briefing } from "@/lib/types";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Play, Pause, Square, Sparkles, Volume2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface BriefingPlayerProps {
  briefing: Briefing | null;
  loading?: boolean;
}

export function BriefingPlayer({ briefing, loading }: BriefingPlayerProps) {
  const { speak, stop, pause, resume, isPlaying, isPaused, speechProgress } = useAudioPlayer();
  const [showFullScript, setShowFullScript] = useState(false);

  if (loading || !briefing) {
    return (
      <div className="rounded-3xl p-6 bg-gradient-to-b from-indigo-950/40 to-aura-card border border-aura-border animate-pulse h-64 flex flex-col justify-center items-center gap-3">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="text-xs text-zinc-400">Synthesizing Arjun's 60s morning briefing...</span>
      </div>
    );
  }

  const handlePlayToggle = () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(briefing.script);
    }
  };

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-[#1A1A3A] via-[#121429] to-[#0D0F1D] border border-violet-500/30 shadow-xl shadow-indigo-950/40 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-aura-primary/20 via-aura-accent/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header Tag */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            Morning Voice Intelligence
          </span>
        </div>
        <span className="text-[10px] text-zinc-400">
          {briefing.generated_at} • ~60 sec
        </span>
      </div>

      <h2 className="text-lg font-bold text-white mb-1 tracking-tight">
        Your Proactive Daily Briefing
      </h2>
      <p className="text-xs text-zinc-300 mb-5 leading-relaxed">
        Autonomous pattern synthesis across UPI spends, 8:30 AM attendance, and OS Mid-Term readiness.
      </p>

      {/* Big Action Play Button with Animated Waveform */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4 mb-4">
        <button
          onClick={handlePlayToggle}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-aura-primary via-indigo-600 to-aura-accent text-white font-semibold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-aura-primary/30 hover:opacity-95 active:scale-[0.98] transition-all"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause Briefing</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>{isPaused ? "Resume Briefing" : "Play 60s Morning Briefing"}</span>
            </>
          )}
        </button>

        {/* Animated Waveform Visualizer */}
        <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900/60 border border-white/5">
          {[40, 75, 30, 95, 60, 85, 45, 90].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying
                  ? "bg-gradient-to-t from-aura-primary to-pink-400 animate-pulse"
                  : "bg-zinc-700 h-2"
              }`}
              style={{
                height: isPlaying ? `${Math.max(6, (h * (i % 2 === 0 ? 1 : 0.7)) / 3.5)}px` : "6px",
                animationDelay: `${i * 120}ms`,
              }}
            />
          ))}
        </div>

        {isPlaying && (
          <button
            onClick={stop}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Stop Speech"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        )}
      </div>

      {/* Playback progress bar */}
      {speechProgress > 0 && (
        <div className="w-full bg-zinc-800 rounded-full h-1 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-aura-primary to-aura-accent h-1 transition-all duration-200"
            style={{ width: `${speechProgress}%` }}
          />
        </div>
      )}

      {/* Highlights Feed */}
      <div className="space-y-2 mb-3">
        {briefing.highlights.map((highlight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-200"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-aura-primary shrink-0 mt-0.5" />
            <span className="leading-snug">{highlight}</span>
          </div>
        ))}
      </div>

      {/* Expand Full Transcript */}
      <button
        onClick={() => setShowFullScript(!showFullScript)}
        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium pt-1"
      >
        <span>{showFullScript ? "Hide Voice Transcript" : "Read Full Voice Script"}</span>
        {showFullScript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showFullScript && (
        <div className="mt-2.5 p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-zinc-300 leading-relaxed italic animate-in fade-in">
          "{briefing.script}"
        </div>
      )}
    </div>
  );
}
