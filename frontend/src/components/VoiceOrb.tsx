"use client";

import { useState } from "react";
import { Mic, MicOff, Sparkles, X, Volume2, ArrowRight } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { api } from "@/lib/api";
import { WhatIfResponse } from "@/lib/types";

export function VoiceOrb() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { isListening, transcript, error, startListening, stopListening } = useVoice();
  const { speak, isPlaying, stop: stopAudio } = useAudioPlayer();

  const handleOrbClick = () => {
    setIsOpen(true);
    setResult(null);
    startListening((finalTranscript) => {
      setQuery(finalTranscript);
      executeSimulation(finalTranscript);
    });
  };

  const executeSimulation = async (textToQuery: string) => {
    if (!textToQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.askWhatIf(textToQuery);
      setResult(res);
      // Auto-speak response in voice-first spirit
      speak(res.spoken_answer);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      executeSimulation(query);
    }
  };

  return (
    <>
      {/* Floating Action Orb in bottom right */}
      <button
        onClick={handleOrbClick}
        className="fixed bottom-20 right-4 z-40 p-3.5 rounded-full bg-gradient-to-tr from-aura-primary via-indigo-500 to-aura-accent text-white shadow-xl shadow-aura-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        title="Ask AURA by Voice"
      >
        <span className="absolute inset-0 rounded-full bg-aura-primary animate-ping opacity-30" />
        <Mic className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Interactive Voice Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#12162A] border border-aura-border p-5 text-white shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
            {/* Ambient Orb Glow */}
            <div className="absolute -top-16 -left-16 w-44 h-44 bg-aura-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-aura-primary to-aura-accent flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Voice Personal Twin</h3>
                  <p className="text-[10px] text-indigo-300">Speak or ask any hypothetical question</p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopListening();
                  stopAudio();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Listening Orb Centerpiece */}
            <div className="my-5 flex flex-col items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening((txt) => {
                      setQuery(txt);
                      executeSimulation(txt);
                    });
                  }
                }}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-gradient-to-tr from-rose-500 to-amber-500 scale-110 shadow-[0_0_30px_#EF4444]"
                    : "bg-gradient-to-tr from-aura-primary to-aura-accent shadow-[0_0_20px_#8B5CF6]"
                }`}
              >
                {isListening && (
                  <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
                )}
                {isListening ? (
                  <MicOff className="w-8 h-8 text-white relative z-10" />
                ) : (
                  <Mic className="w-8 h-8 text-white relative z-10" />
                )}
              </button>

              <span className="text-xs font-medium text-zinc-300">
                {isListening
                  ? "Listening to Arjun... speak now"
                  : loading
                  ? "Simulating impact across your twin..."
                  : "Tap mic to speak"}
              </span>

              {transcript && (
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-indigo-200 text-center max-w-xs">
                  "{transcript}"
                </div>
              )}

              {error && <p className="text-[11px] text-rose-400">{error}</p>}
            </div>

            {/* Quick Text Input fallback */}
            <form onSubmit={handleFormSubmit} className="flex gap-2 mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Or type e.g. What if I order Zomato tonight?"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-aura-primary"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="p-2 rounded-xl bg-aura-primary text-white disabled:opacity-50 hover:bg-violet-600 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Simulation Result Card */}
            {result && (
              <div className="overflow-y-auto space-y-3 p-3.5 rounded-2xl bg-black/50 border border-violet-500/30 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                    Predicted Outcome
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      result.risk_score >= 80
                        ? "bg-red-950 text-red-300 border border-red-500/30"
                        : result.risk_score >= 50
                        ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    Risk Score: {result.risk_score}/100
                  </span>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  {result.spoken_answer}
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => speak(result.spoken_answer)}
                    className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? "Playing voice..." : "Replay voice"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
