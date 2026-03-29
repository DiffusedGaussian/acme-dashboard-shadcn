import { X } from 'lucide-react';
import type { CallRecord } from '../../types';
import {
  formatCurrency, formatDuration, formatTimestamp,
  getOutcomeConfig, getSentimentConfig,
} from '../../utils';

interface CallsTableProps {
  calls: CallRecord[];
  selectedCallId: string | null;
  onSelect: (call: CallRecord | null) => void;
}

export function CallsTable({ calls, selectedCallId, onSelect }: CallsTableProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Call Log</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {selectedCallId
              ? 'Click the selected row again to deselect · map updates automatically'
              : 'Click any row to highlight it on the map'}
          </p>
        </div>
        {selectedCallId && (
          <button
            onClick={() => onSelect(null)}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-3 w-3" /> Clear selection
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 whitespace-nowrap">Time</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Carrier</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Route</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Outcome</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Sentiment</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Rounds</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Offered</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Agreed</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Discount</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 pr-6 whitespace-nowrap">Duration</th>
            </tr>
          </thead>
          <tbody>
            {calls.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-muted-foreground text-sm px-6">
                  No calls recorded yet. Click "Demo Calls" to generate sample data.
                </td>
              </tr>
            ) : (
              calls.map((call, i) => {
                const outcome = getOutcomeConfig(call.outcome);
                const sentiment = getSentimentConfig(call.sentiment);
                const isBooked = call.outcome === 'load_booked' || call.outcome === 'price_agreed_transfer';
                const isFailed = call.outcome === 'carrier_ineligible' || call.outcome === 'call_dropped';
                const isSelected = call.id === selectedCallId;
                const isDimmed = selectedCallId !== null && !isSelected;

                return (
                  <tr
                    key={call.id}
                    onClick={() => onSelect(isSelected ? null : call)}
                    className={`border-b last:border-0 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-primary/5 ring-1 ring-inset ring-primary/20'
                        : isDimmed
                        ? 'opacity-40 hover:opacity-70'
                        : i % 2 === 0 ? 'hover:bg-muted/40' : 'bg-muted/10 hover:bg-muted/40'
                    }`}
                  >
                    <td className="px-6 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(call.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-sm">{call.carrier_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">MC# {call.carrier_mc || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {call.origin_city ? (
                        <span className="text-foreground/80">
                          {call.origin_city}, {call.origin_state} → {call.destination_city}, {call.destination_state}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{call.load_id || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${
                        isBooked
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : isFailed
                          ? 'bg-warning/10 text-warning border border-warning/20'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {outcome.icon} {outcome.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-muted-foreground">{sentiment.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {call.negotiation_rounds > 0 ? (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {call.negotiation_rounds}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground whitespace-nowrap">
                      {formatCurrency(call.loadboard_rate)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums font-medium whitespace-nowrap">
                      {formatCurrency(call.final_rate)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs whitespace-nowrap">
                      {call.discount_percentage != null && call.discount_percentage > 0
                        ? <span className="text-warning">-{call.discount_percentage.toFixed(1)}%</span>
                        : call.discount_percentage === 0
                        ? <span className="text-muted-foreground">0%</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3 pr-6 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {formatDuration(call.duration_seconds)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
