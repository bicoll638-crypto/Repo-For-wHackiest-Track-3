"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TimelineFeed } from "@/components/TimelineFeed";
import { PrivacyModal } from "@/components/PrivacyBadge";
import { api } from "@/lib/api";
import { LifeEvent } from "@/lib/types";
import { CalendarDays, RefreshCw } from "lucide-react";

export default function TimelinePage() {
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      setEvents(res);
    } catch (err) {
      console.error("Failed to load timeline events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenPrivacy={() => setPrivacyOpen(true)} />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
              <CalendarDays className="w-4 h-4 text-aura-primary" />
              <span>Unified Student Feed</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-0.5">
              Personal Data Timeline
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {events.length} multi-variable events logged across 30 days
            </p>
          </div>

          <button
            onClick={loadEvents}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-aura-primary" : ""}`} />
          </button>
        </div>

        {/* Timeline Feed */}
        <TimelineFeed events={events} loading={loading} />
      </div>

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        onDataChanged={loadEvents}
      />
    </div>
  );
}
