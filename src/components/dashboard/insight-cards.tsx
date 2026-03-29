import { Clock, Repeat2, SmilePlus, Lightbulb } from 'lucide-react';
import type { CallRecord } from '../../types';

interface Insight {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  accent: string;
}

function formatHour(h: number) {
  const ampm = h < 12 ? 'am' : 'pm';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}${ampm}`;
}

function computeInsights(calls: CallRecord[]): Insight[] {
  const insights: Insight[] = [];
  const isBooked = (c: CallRecord) =>
    c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer';

  // ── Insight 1: Best booking hour ──
  const hourStats: Record<number, { total: number; booked: number }> = {};
  calls.forEach(c => {
    const hour = new Date(c.timestamp).getHours();
    if (!hourStats[hour]) hourStats[hour] = { total: 0, booked: 0 };
    hourStats[hour].total++;
    if (isBooked(c)) hourStats[hour].booked++;
  });
  const qualifiedHours = Object.entries(hourStats)
    .filter(([, s]) => s.total >= 2)
    .map(([hour, s]) => ({ hour: parseInt(hour), rate: s.booked / s.total, ...s }))
    .sort((a, b) => b.rate - a.rate);

  if (qualifiedHours.length > 0) {
    const best = qualifiedHours[0];
    insights.push({
      icon: Clock,
      label: 'Best booking window',
      value: `${formatHour(best.hour)}–${formatHour(best.hour + 1)}`,
      detail: `${Math.round(best.rate * 100)}% close rate on ${best.total} calls`,
      accent: 'text-foreground bg-muted/50 border-border',
    });
  }

  // ── Insight 2: Negotiation sweet spot ──
  const byRound = [1, 2, 3]
    .map(round => {
      const at = calls.filter(c => c.negotiation_rounds === round);
      const bookedCount = at.filter(isBooked).length;
      return { round, total: at.length, booked: bookedCount, rate: at.length > 0 ? bookedCount / at.length : 0 };
    })
    .filter(r => r.total >= 2);

  if (byRound.length > 0) {
    const best = [...byRound].sort((a, b) => b.rate - a.rate)[0];
    insights.push({
      icon: Repeat2,
      label: `Round ${best.round} closes the most`,
      value: `${Math.round(best.rate * 100)}%`,
      detail: `of ${best.total} counter-offers ended in a deal`,
      accent: 'text-warning bg-warning/10 border-warning/20',
    });
  }

  // ── Insight 3: Sentiment → booking correlation ──
  const positives = calls.filter(c =>
    c.sentiment === 'very_positive' || c.sentiment === 'positive' || c.sentiment === 'eager'
  );
  const negatives = calls.filter(c =>
    c.sentiment === 'negative' || c.sentiment === 'very_negative' || c.sentiment === 'frustrated'
  );

  if (positives.length >= 2) {
    const posRate = positives.filter(isBooked).length / positives.length;
    const negRate = negatives.length > 0 ? negatives.filter(isBooked).length / negatives.length : 0;
    const multiplier = negRate > 0 ? (posRate / negRate).toFixed(1) : null;
    insights.push({
      icon: SmilePlus,
      label: 'Sentiment predicts outcome',
      value: multiplier ? `${multiplier}×` : `${Math.round(posRate * 100)}%`,
      detail: multiplier
        ? `positive carriers book ${multiplier}× more than frustrated ones`
        : `of positive-sentiment calls result in a booking`,
      accent: 'text-primary bg-primary/5 border-primary/30',
    });
  }

  // Fallback if not enough data
  if (insights.length === 0) {
    insights.push({
      icon: Lightbulb,
      label: 'Insight engine warming up',
      value: '—',
      detail: 'Generate a few calls to surface patterns',
      accent: 'text-muted-foreground bg-muted border-border',
    });
  }

  return insights;
}

interface InsightCardsProps {
  calls: CallRecord[];
}

export function InsightCards({ calls }: InsightCardsProps) {
  const insights = computeInsights(calls);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {insights.map((insight, i) => {
        const { icon: Icon } = insight;
        return (
          <div
            key={i}
            className={`rounded-xl border p-4 ${insight.accent} transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide opacity-70">{insight.label}</p>
                <p className="text-2xl font-bold tracking-tight mt-0.5">{insight.value}</p>
                <p className="text-xs mt-1 opacity-70 leading-snug">{insight.detail}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
