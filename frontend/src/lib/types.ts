export type EventType = "expense" | "class" | "sleep" | "study" | "deadline";

export interface LifeEvent {
  id: number;
  user_id: string;
  event_type: EventType;
  title: string;
  timestamp: string;
  amount?: number | null;
  category?: string | null;
  merchant?: string | null;
  duration_minutes?: number | null;
  status?: string | null;
  subject?: string | null;
  confidence_score: number;
  raw_text?: string | null;
  source: string;
  extra_data?: string | null;
  created_at: string;
}

export interface Insight {
  id?: number | null;
  detector_key: string;
  severity: "info" | "warn" | "critical";
  title: string;
  cause: string;
  effect: string;
  explanation: string;
  action: string;
  evidence_event_ids: number[];
  evidence_events: LifeEvent[];
  created_at?: string | null;
}

export interface BudgetSummary {
  monthly_budget: number;
  total_spent: number;
  remaining_budget: number;
  burn_rate_daily: number;
  target_daily_budget: number;
  projected_depletion_day: number;
  projected_depletion_date: string;
  days_early: number;
  days_remaining_in_month: number;
  status: "on_track" | "warning" | "critical_burn";
}

export interface Briefing {
  script: string;
  highlights: string[];
  generated_at: string;
  word_count: number;
  audio_url?: string | null;
  key_metrics: {
    remaining_budget?: number;
    daily_burn?: number;
    safe_daily?: number;
    projected_depletion_day?: number;
    late_spend_total?: number;
    [key: string]: any;
  };
}

export interface WhatIfResponse {
  question: string;
  intent: string;
  risk_score: number; // 0 to 100
  risk_level: "low" | "moderate" | "high" | "critical";
  predicted_consequences: string[];
  recommendation: string;
  spoken_answer: string;
  reasoning_chain: string[];
  metrics_delta?: Record<string, any>;
}

export interface IngestResponse {
  success: boolean;
  parsed_events: LifeEvent[];
  message: string;
  extraction_confidence: number;
}

export interface HealthResponse {
  status: string;
  mode: string;
  persona: string;
  total_events: number;
  last_event_time?: string | null;
}
