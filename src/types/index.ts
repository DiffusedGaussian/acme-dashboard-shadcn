/* ============================================
   ACME Logistics Dashboard — Type Definitions
   ============================================ */

// ── Call Outcomes ──
export type CallOutcome =
  | 'load_booked'
  | 'price_agreed_transfer'
  | 'no_agreement'
  | 'carrier_not_interested'
  | 'carrier_ineligible'
  | 'no_matching_loads'
  | 'call_dropped'
  | 'carrier_hung_up'
  | 'max_negotiations_reached';

// ── Carrier Sentiment ──
export type CarrierSentiment =
  | 'very_positive'
  | 'positive'
  | 'eager'
  | 'neutral'
  | 'negative'
  | 'very_negative'
  | 'frustrated';

// ── Load Data ──
export interface Load {
  load_id: string;
  origin: string;
  destination: string;
  pickup_datetime: string;
  delivery_datetime: string;
  equipment_type: string;
  loadboard_rate: number;
  notes?: string;
  weight?: number;
  commodity_type?: string;
}

// ── Carrier Data ──
export interface Carrier {
  mc_number: string;
  name: string;
  dot_number?: string;
  is_eligible: boolean;
  safety_rating?: string;
  insurance_status?: string;
}

// ── Call Analysis ──
export interface CallAnalysis {
  summary: string;
  professionalism_score: number;   // 1–10
  deal_quality: 'excellent' | 'good' | 'fair' | 'poor' | 'n/a';
  key_moments: string[];
  red_flags: string[];
  recommendations: string;
}

// ── Call Record ──
export interface CallRecord {
  id: string;
  timestamp: string;
  carrier_name: string;
  carrier_mc: string;
  load_id: string | null;
  outcome: CallOutcome;
  sentiment: CarrierSentiment;
  duration_seconds: number;
  negotiation_rounds: number;
  loadboard_rate: number | null;
  final_rate: number | null;
  discount_percentage: number | null;
  transfer_successful: boolean;
  origin_city?: string | null;
  origin_state?: string | null;
  destination_city?: string | null;
  destination_state?: string | null;
  notes?: string;
  call_analysis?: CallAnalysis | null;
}

// ── Dashboard Metrics ──
export interface DashboardMetrics {
  total_calls: number;
  successful_bookings: number;
  conversion_rate: number;
  transfers_to_rep: number;
  avg_call_duration_seconds: number;
  avg_negotiation_rounds: number;
  total_revenue_booked: number;
  avg_discount_from_loadboard: number;
  sentiment_positive: number;
  sentiment_neutral: number;
  sentiment_negative: number;
}

// ── Outcome Distribution ──
export type OutcomeDistribution = Partial<Record<CallOutcome, number>>;

// ── Dashboard API Response ──
export interface DashboardData {
  metrics: DashboardMetrics;
  recent_calls: CallRecord[];
  outcome_distribution: OutcomeDistribution;
}

// ── FMCSA Carrier Verification ──
export interface FMCSAVerification {
  mc_number: string;
  legal_name: string;
  dba_name?: string;
  entity_type: string;
  operating_status: string;
  is_authorized: boolean;
  safety_rating: string;
  insurance: {
    bipd_required: number;
    cargo_required: number;
    bipd_on_file: number;
    cargo_on_file: number;
  };
}

// ── API Connection Status ──
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// ── Chart Data Types ──
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}
