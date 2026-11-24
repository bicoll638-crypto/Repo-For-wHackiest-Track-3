"use client";

import { useState } from "react";
import { WhatIfResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { useVoice } from "@/hooks/useVoice";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import {
  HelpCircle,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Volume2,
  CheckCircle2,
  Lightbulb,
  ListOrdered,
} from "lucide-react";

export function WhatIfPanel() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { isListening, transcript, startListening, stopListening } = useVoice();
  const { speak, isPlaying, stop: stopAudio } = useAudioPlayer();

  const exampleQuestions = [
    "What if I order Zomato tonight?",
    "What if I skip tomorrow's 8:30 AM class?",
    "What if I skip my study session tonight?",
    "What if I buy headphones for 1200?",
    "What if I go to bed at 10:30 PM?",
  ];

  const handleSimulate = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setQuestion(q);
    try {
      const res = await api.askWhatIf(q);
      setResult(res);
      // Automatically speak the response
      speak(res.spoken_answer);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTrigger = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        handleSimulate(text);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Box */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#16172E] via-[#121424] to-aura-card border border-violet-500/30 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-aura-accent" />
          <h3 className="text-sm font-bold text-white">What-If Personal Simulation Lab</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          Ask prospective scenario questions. AURA predicts multi-variable impacts
          across your budget, sleep debt, and academic deadlines.
        </p>

        {/* Input Bar */}
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSimulate(question)}
            placeholder="e.g. What if I order Zomato tonight?"
            className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-aura-primary transition-colors"
          />

          {/* Voice Input Button */}
          <button
            onClick={handleVoiceTrigger}
            className={`p-2.5 rounded-2xl transition-all ${
              isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white"
            }`}
            title="Ask via Voice"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Run Simulation Button */}
          <button
            onClick={() => handleSimulate(question)}
            disabled={loading || !question.trim()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-aura-primary to-indigo-600 text-white font-semibold text-xs disabled:opacity-50 hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-aura-primary/30"
          >
            {loading ? "Simulating..." : "Simulate"}
          </button>
        </div>

        {/* Quick Example Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-500 block font-medium">Quick Scenarios:</span>
          <div className="flex flex-wrap gap-1.5">
            {exampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSimulate(q)}
                className="text-[10px] px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-indigo-300 hover:text-white border border-white/5 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Result Presentation */}
      {result && (
        <div className="rounded-3xl p-5 bg-aura-card border border-aura-border space-y-4 animate-in fade-in duration-300">
          {/* Risk Gauge Header */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                Multi-Variable Risk Assessment
              </span>
              <h4 className="text-base font-bold text-white capitalize mt-0.5">
                {result.risk_level} Risk Level
              </h4>
            </div>

            {/* Circular / Pill Gauge */}
            <div className="flex items-center gap-3">
              <div
                className={`text-lg font-black px-3 py-1.5 rounded-2xl border ${
                  result.risk_score >= 80
                    ? "bg-red-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_15px_#EF4444]"
                    : result.risk_score >= 50
                    ? "bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_15px_#F59E0B]"
                    : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_#10B981]"
                }`}
              >
                {result.risk_score}
                <span className="text-xs font-normal opacity-70">/100</span>
              </div>
            </div>
          </div>

          {/* Spoken Answer & Voice Replay */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">
                Spoken Voice Synthesis
              </span>
              <button
                onClick={() => speak(result.spoken_answer)}
                className="flex items-center gap-1 text-[11px] text-aura-primary hover:text-white"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlaying ? "Speaking..." : "Replay Audio"}</span>
              </button>
            </div>
            <p className="text-xs text-white leading-relaxed italic">
              "{result.spoken_answer}"
            </p>
          </div>

          {/* Predicted Consequences */}
          <div>
            <h5 className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Predicted Downstream Consequences
            </h5>
            <div className="space-y-1.5">
              {result.predicted_consequences.map((c, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span className="leading-snug">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Actionable Advice
              </span>
              <p className="text-xs text-emerald-200 mt-0.5 leading-snug">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Transparent Reasoning Chain */}
          <div>
            <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
              Transparent Reasoning Chain
            </h5>
            <div className="space-y-1 pl-1">
              {result.reasoning_chain.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-white/5 text-zinc-500 flex items-center justify-center text-[9px] shrink-0 font-mono">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
