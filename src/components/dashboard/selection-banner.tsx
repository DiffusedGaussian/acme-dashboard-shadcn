import { X } from 'lucide-react';
import type { CallRecord } from '../../types';
import { getOutcomeConfig, getSentimentConfig, formatCurrency } from '../../utils';

interface SelectionBannerProps {
  call: CallRecord;
  onClear: () => void;
}

export function SelectionBanner({ call, onClear }: SelectionBannerProps) {
  const outcome = getOutcomeConfig(call.outcome);
  const sentiment = getSentimentConfig(call.sentiment);
  const isBooked = call.outcome === 'load_booked' || call.outcome === 'price_agreed_transfer';

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-xs font-medium text-primary/70 uppercase tracking-wide">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Filtering all charts
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-3 flex-1 flex-wrap">
        <span className="font-semibold text-sm">{call.carrier_name || 'Unknown Carrier'}</span>
        <span className="text-xs text-muted-foreground">MC# {call.carrier_mc}</span>
        {call.origin_city && (
          <span className="text-xs bg-muted px-2 py-0.5 rounded-md">
            {call.origin_city}, {call.origin_state} → {call.destination_city}, {call.destination_state}
          </span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
          isBooked ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
        }`}>
          {outcome.icon} {outcome.label}
        </span>
        <span className="text-xs text-muted-foreground">{sentiment.label}</span>
        {call.negotiation_rounds > 0 && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
            {call.negotiation_rounds} round{call.negotiation_rounds > 1 ? 's' : ''}
          </span>
        )}
        {call.final_rate && (
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(call.final_rate)}</span>
        )}
      </div>
      <button
        onClick={onClear}
        className="ml-auto inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border hover:bg-muted transition-colors text-muted-foreground"
      >
        <X className="h-3 w-3" /> Clear
      </button>
    </div>
  );
}
