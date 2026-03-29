import {
  CheckCircle2, XCircle, AlertCircle, Clock, Repeat2, ArrowRight,
  ShieldCheck, ShieldX, Star, AlertTriangle, Lightbulb, Sparkles, MessageSquare,
} from 'lucide-react';
import type { CallRecord, CallAnalysis } from '../../types';
import {
  getOutcomeConfig, getSentimentConfig,
  formatCurrency, formatDuration, formatTimestamp,
} from '../../utils';
import { NetworkExplorer } from './network-explorer';

// ── Rate story bar ──────────────────────────────────────────────────────────

function RateStory({ call }: { call: CallRecord }) {
  const offered = call.loadboard_rate;
  const agreed  = call.final_rate;
  if (!offered) return null;

  const max = Math.max(offered, agreed || offered) * 1.08;
  const offeredPct = (offered / max) * 100;
  const agreedPct  = agreed ? (agreed / max) * 100 : null;
  const savings    = agreed ? offered - agreed : null;

  return (
    <div className="rounded-xl border bg-card p-3.5">
      <h3 className="text-sm font-semibold mb-2.5">Rate Walk</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Offered</span>
            <span className="font-medium">{formatCurrency(offered)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-slate-400 rounded-full transition-all duration-500"
              style={{ width: `${offeredPct}%` }} />
          </div>
        </div>
        {agreedPct !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Agreed</span>
              <span className="font-medium">{formatCurrency(agreed)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  savings && savings > 0 ? 'bg-primary' : 'bg-slate-400'
                }`}
                style={{ width: `${agreedPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {savings !== null && savings > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-lg font-semibold">
            -{call.discount_percentage?.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">
            {formatCurrency(savings)} off the initial offer
          </span>
        </div>
      )}
      {agreedPct === null && (
        <p className="mt-3 text-xs text-muted-foreground">No rate was agreed on this call.</p>
      )}
    </div>
  );
}

// ── Negotiation timeline ────────────────────────────────────────────────────

function NegotiationTimeline({ call }: { call: CallRecord }) {
  if (call.negotiation_rounds === 0) return null;
  const isBooked = call.outcome === 'load_booked' || call.outcome === 'price_agreed_transfer';
  const rounds = call.negotiation_rounds;

  return (
    <div className="rounded-xl border bg-card p-3.5">
      <h3 className="text-sm font-semibold mb-2.5">Negotiation</h3>
      <div className="relative flex items-center">
        <div className="h-3 w-3 rounded-full bg-slate-300 border-2 border-slate-400 flex-shrink-0 z-10" />
        {Array.from({ length: rounds }).map((_, i) => {
          const isLast = i === rounds - 1;
          const dotColor = isLast
            ? isBooked ? 'bg-primary border-primary/80' : 'bg-warning border-warning/80'
            : 'bg-muted-foreground/40 border-muted-foreground/20';
          return (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex-1 h-0.5 ${isLast && isBooked ? 'bg-primary/40' : isLast ? 'bg-warning/40' : 'bg-border'}`} />
              <div className={`h-3 w-3 rounded-full border-2 flex-shrink-0 z-10 ${dotColor}`} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{formatCurrency(call.loadboard_rate)}</span>
        <span className="text-center text-[10px]">
          {rounds} counter-offer{rounds > 1 ? 's' : ''}
        </span>
        <span className={`font-medium ${isBooked ? 'text-primary' : 'text-warning'}`}>
          {call.final_rate ? formatCurrency(call.final_rate) : 'No deal'}
        </span>
      </div>
    </div>
  );
}

// ── Sentiment card ──────────────────────────────────────────────────────────

const SENTIMENT_VISUAL: Record<string, { bar: string; bg: string; text: string; description: string }> = {
  very_positive: { bar: 'bg-primary',              bg: 'bg-primary/5',    text: 'text-primary',             description: 'Carrier was highly cooperative and enthusiastic.' },
  positive:      { bar: 'bg-primary',              bg: 'bg-primary/5',    text: 'text-primary',             description: 'Positive tone throughout the call.' },
  eager:         { bar: 'bg-primary',              bg: 'bg-primary/5',    text: 'text-primary',             description: 'Carrier was eager to work with us.' },
  neutral:       { bar: 'bg-muted-foreground/40',  bg: 'bg-muted',        text: 'text-muted-foreground',    description: 'Call was professional but non-committal.' },
  negative:      { bar: 'bg-warning',              bg: 'bg-warning/5',    text: 'text-warning',             description: 'Carrier showed signs of reluctance or frustration.' },
  very_negative: { bar: 'bg-warning',              bg: 'bg-warning/5',    text: 'text-warning',             description: 'Carrier was clearly unhappy during the call.' },
  frustrated:    { bar: 'bg-warning',              bg: 'bg-warning/5',    text: 'text-warning',             description: 'Significant frustration detected.' },
};

// Score: very_positive=7, positive=6, eager=6, neutral=4, negative=2, very_negative=1, frustrated=1 (out of 7)
const SENTIMENT_SCORE: Record<string, number> = {
  very_positive: 7, positive: 6, eager: 6, neutral: 4,
  negative: 2, very_negative: 1, frustrated: 1,
};

function SentimentCard({ call }: { call: CallRecord }) {
  const cfg = getSentimentConfig(call.sentiment);
  const visual = SENTIMENT_VISUAL[call.sentiment] ?? SENTIMENT_VISUAL.neutral;
  const score = SENTIMENT_SCORE[call.sentiment] ?? 4;

  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Carrier Sentiment</h3>
      </div>
      <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold mb-2 ${visual.bg} ${visual.text}`}>
        {cfg.label}
      </div>
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full ${i < score ? visual.bar : 'bg-muted'}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{visual.description}</p>
    </div>
  );
}

// ── AI Analysis panel ───────────────────────────────────────────────────────

const DEAL_QUALITY_CONFIG = {
  excellent: { label: 'Excellent', className: 'bg-primary/10 text-primary border-primary/20' },
  good:      { label: 'Good',      className: 'bg-primary/5  text-primary/70 border-primary/10' },
  fair:      { label: 'Fair',      className: 'bg-warning/10 text-warning border-warning/20' },
  poor:      { label: 'Poor',      className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'n/a':     { label: 'N/A',       className: 'bg-muted text-muted-foreground border-border' },
};

function CallAnalysisPanel({ analysis }: { analysis: CallAnalysis }) {
  const dq = DEAL_QUALITY_CONFIG[analysis.deal_quality] ?? DEAL_QUALITY_CONFIG['n/a'];
  const score = analysis.professionalism_score;

  return (
    <div className="rounded-xl border bg-card p-3.5 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Analysis</h3>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${dq.className}`}>
          {dq.label} deal
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {analysis.summary}
      </p>

      {/* Professionalism score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Professionalism</span>
          <span className="text-xs font-semibold tabular-nums">{score} / 10</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < score
                  ? score >= 8 ? 'bg-primary'
                  : score >= 5 ? 'bg-warning'
                  : 'bg-destructive'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Key moments */}
      {analysis.key_moments.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Key Moments</span>
          </div>
          <ul className="space-y-1.5">
            {analysis.key_moments.map((moment, i) => (
              <li key={i} className="text-xs text-foreground/80 flex gap-2">
                <span className="text-primary mt-0.5 shrink-0">·</span>
                {moment}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red flags */}
      {analysis.red_flags.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Red Flags</span>
          </div>
          <ul className="space-y-1.5">
            {analysis.red_flags.map((flag, i) => (
              <li key={i} className="text-xs text-foreground/80 flex gap-2">
                <span className="text-warning mt-0.5 shrink-0">·</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div className="pt-4 border-t">
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommendation</span>
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">{analysis.recommendations}</p>
      </div>

    </div>
  );
}

// ── Main detail view ────────────────────────────────────────────────────────

interface CallDetailViewProps {
  call: CallRecord;
  allCalls: CallRecord[];
}

export function CallDetailView({ call, allCalls }: CallDetailViewProps) {
  const outcome    = getOutcomeConfig(call.outcome);
  const isBooked   = call.outcome === 'load_booked' || call.outcome === 'price_agreed_transfer';
  const isFailed   = call.outcome === 'carrier_ineligible' || call.outcome === 'call_dropped' || call.outcome === 'carrier_hung_up';
  const isIneligible = call.outcome === 'carrier_ineligible';

  return (
    <div className="p-4 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3 items-start">

      {/* ── Left column: deal facts ── */}
      <div className="space-y-3">

        {/* Deal header */}
        <div className="rounded-xl border bg-card p-3.5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg mb-2 ${
                isBooked  ? 'bg-primary/10 text-primary' :
                isFailed  ? 'bg-warning/10 text-warning' :
                            'bg-muted text-muted-foreground'
              }`}>
                {isBooked  ? <CheckCircle2 className="h-4 w-4" /> :
                 isFailed  ? <XCircle className="h-4 w-4" /> :
                             <AlertCircle className="h-4 w-4" />}
                {outcome.label}
              </div>
              <h2 className="text-xl font-semibold truncate">{call.carrier_name || 'Unknown Carrier'}</h2>
              <p className="text-sm text-muted-foreground">MC# {call.carrier_mc}</p>
            </div>

            {call.final_rate ? (
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold tabular-nums text-primary">
                  {formatCurrency(call.final_rate)}
                </div>
                {call.discount_percentage != null && call.discount_percentage > 0 && (
                  <div className="text-xs text-warning mt-0.5">
                    -{call.discount_percentage.toFixed(1)}% off offer
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-0.5">agreed rate</div>
              </div>
            ) : (
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-semibold text-muted-foreground">—</div>
                <div className="text-xs text-muted-foreground">no rate agreed</div>
              </div>
            )}
          </div>

          {call.origin_city && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm font-medium">{call.origin_city}, {call.origin_state}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">{call.destination_city}, {call.destination_state}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
            <span>{formatTimestamp(call.timestamp)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(call.duration_seconds)}
            </span>
            {call.negotiation_rounds > 0 && (
              <span className="flex items-center gap-1">
                <Repeat2 className="h-3 w-3" />
                {call.negotiation_rounds} negotiation round{call.negotiation_rounds > 1 ? 's' : ''}
              </span>
            )}
            <span className="flex items-center gap-1">
              {isIneligible
                ? <ShieldX className="h-3 w-3 text-warning" />
                : <ShieldCheck className="h-3 w-3 text-primary" />}
              {isIneligible ? 'FMCSA ineligible' : 'FMCSA verified'}
            </span>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <RateStory call={call} />
          <NegotiationTimeline call={call} />
          <SentimentCard call={call} />
        </div>

        {call.origin_city && (
          <NetworkExplorer calls={allCalls} selectedCall={call} />
        )}
      </div>

      {/* ── Right column: AI analysis ── */}
      <div>
        {call.call_analysis ? (
          <CallAnalysisPanel analysis={call.call_analysis} />
        ) : (
          <div className="rounded-xl border border-dashed bg-card/50 p-5 text-center">
            <Sparkles className="h-5 w-5 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Analysis not yet available for this call.</p>
          </div>
        )}
      </div>

    </div>
  );
}
