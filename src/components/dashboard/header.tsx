import { RefreshCw } from 'lucide-react';
import type { ConnectionStatus, DashboardMetrics, OutcomeDistribution } from '../../types';
import { formatPercentage, formatDuration } from '../../utils';

interface HeaderProps {
  status: ConnectionStatus;
  isLoading: boolean;
  onRefresh: () => void;
  metrics: DashboardMetrics;
  distribution: OutcomeDistribution;
}

export function Header({
  status, isLoading,
  onRefresh,
  metrics, distribution,
}: HeaderProps) {
  const totalCalls   = Object.values(distribution).reduce((a, b) => a + (b || 0), 0);
  const ineligible   = distribution.carrier_ineligible || 0;
  const fmcsaPassPct = totalCalls > 0 ? (((totalCalls - ineligible) / totalCalls) * 100) : 0;

  const kpis = [
    { label: 'Calls',        value: metrics.total_calls.toString() },
    { label: 'Booked',       value: metrics.successful_bookings.toString() },
    { label: 'Conversion',   value: formatPercentage(metrics.conversion_rate) },
    { label: 'Revenue',      value: `$${(metrics.total_revenue_booked / 1000).toFixed(1)}k` },
    { label: 'FMCSA Pass',   value: `${fmcsaPassPct.toFixed(0)}%` },
    { label: 'Avg Discount', value: formatPercentage(metrics.avg_discount_from_loadboard) },
    { label: 'Avg Duration', value: formatDuration(metrics.avg_call_duration_seconds) },
  ];

  const isDemo = status === 'disconnected' || status === 'error';

  return (
    <header className="flex items-center h-[52px] px-4 border-b border-border bg-card shrink-0 gap-4">

      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-[11px] font-bold leading-none">A</span>
        </div>
        <span className="text-[13px] font-semibold tracking-tight whitespace-nowrap">ACME Logistics</span>
        <span className="text-[11px] px-1.5 py-0.5 rounded border border-border text-muted-foreground leading-tight">Voice AI</span>
      </div>

      <div className="h-5 w-px bg-border shrink-0" />

      {/* KPI strip */}
      <div className="flex items-center flex-1 min-w-0 overflow-x-auto">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="flex items-center shrink-0">
            {i > 0 && <div className="h-4 w-px bg-border mx-4" />}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                {kpi.label}
              </span>
              <span className="text-[13px] font-semibold font-mono tabular-nums whitespace-nowrap">
                {kpi.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded ${
          status === 'connected'
            ? 'bg-primary/10 text-primary'
            : 'bg-warning/10 text-warning'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
            status === 'connected'
              ? 'bg-primary animate-pulse'
              : 'bg-warning animate-pulse'
          }`} />
          {status === 'connected' ? 'Live' : isDemo ? 'Demo Mode' : 'Connecting…'}
        </span>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[12px] rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>

      </div>

    </header>
  );
}
