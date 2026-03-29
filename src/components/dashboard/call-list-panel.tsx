import { useState } from 'react';
import type { CallRecord } from '../../types';
import { getOutcomeConfig } from '../../utils';

const FILTERS = [
  { label: 'All',    value: null },
  { label: 'Booked', value: ['load_booked', 'price_agreed_transfer'] },
  { label: 'No Deal',value: ['no_agreement', 'carrier_not_interested', 'max_negotiations_reached'] },
  { label: 'Failed', value: ['carrier_ineligible', 'call_dropped', 'carrier_hung_up', 'no_matching_loads'] },
] as const;

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface CallListPanelProps {
  calls: CallRecord[];
  selectedCallId: string | null;
  onSelect: (call: CallRecord | null) => void;
}

export function CallListPanel({ calls, selectedCallId, onSelect }: CallListPanelProps) {
  const [activeFilter, setActiveFilter] = useState<readonly string[] | null>(null);

  const filtered = activeFilter
    ? calls.filter(c => (activeFilter as string[]).includes(c.outcome))
    : calls;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-3 pt-3 pb-2 border-b flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Calls</span>
          <span className="text-xs text-muted-foreground tabular-nums">{filtered.length} / {calls.length}</span>
        </div>
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.value as readonly string[] | null)}
              className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                activeFilter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-muted text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No calls match this filter
          </div>
        ) : (
          filtered.map(call => {
            const outcome = getOutcomeConfig(call.outcome);
            const isBooked = call.outcome === 'load_booked' || call.outcome === 'price_agreed_transfer';
            const isFailed = call.outcome === 'carrier_ineligible' || call.outcome === 'call_dropped' || call.outcome === 'carrier_hung_up';
            const isSelected = call.id === selectedCallId;

            const accentColor = isBooked
              ? 'border-l-primary'
              : isFailed
              ? 'border-l-warning'
              : 'border-l-border';

            return (
              <div
                key={call.id}
                onClick={() => onSelect(isSelected ? null : call)}
                className={`px-3 py-2.5 border-b border-l-2 cursor-pointer transition-all ${accentColor} ${
                  isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate leading-tight">
                      {call.carrier_name || 'Unknown Carrier'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {call.origin_city
                        ? `${call.origin_city} → ${call.destination_city}`
                        : `MC# ${call.carrier_mc}`}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium leading-tight ${
                        isBooked
                          ? 'bg-primary/10 text-primary'
                          : isFailed
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {outcome.label}
                      </span>
                      {call.negotiation_rounds > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {call.negotiation_rounds}r
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold tabular-nums">
                      {call.final_rate ? `$${(call.final_rate / 1000).toFixed(1)}k` : '—'}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {timeAgo(call.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
