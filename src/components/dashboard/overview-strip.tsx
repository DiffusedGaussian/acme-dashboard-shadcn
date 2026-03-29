import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardMetrics, OutcomeDistribution } from '../../types';
import { formatPercentage, formatDuration } from '../../utils';

interface OverviewStripProps {
  metrics: DashboardMetrics;
  distribution: OutcomeDistribution;
}

export function OverviewStrip({ metrics, distribution }: OverviewStripProps) {
  const totalCalls = Object.values(distribution).reduce((a, b) => a + (b || 0), 0);
  const ineligible = distribution.carrier_ineligible || 0;
  const fmcsaPassPct = totalCalls > 0 ? (((totalCalls - ineligible) / totalCalls) * 100) : 0;

  const kpis = [
    {
      label: 'Total Calls',
      value: metrics.total_calls.toString(),
      up: metrics.total_calls > 0,
    },
    {
      label: 'Loads Booked',
      value: metrics.successful_bookings.toString(),
      up: metrics.successful_bookings > 0,
    },
    {
      label: 'Conversion',
      value: formatPercentage(metrics.conversion_rate),
      up: metrics.conversion_rate > 15,
      sub: 'vs 15% avg',
    },
    {
      label: 'Revenue',
      value: `$${(metrics.total_revenue_booked / 1000).toFixed(1)}k`,
      up: metrics.total_revenue_booked > 0,
    },
    {
      label: 'FMCSA Pass',
      value: `${fmcsaPassPct.toFixed(0)}%`,
      up: fmcsaPassPct >= 90,
    },
    {
      label: 'Avg Discount',
      value: formatPercentage(metrics.avg_discount_from_loadboard),
      up: metrics.avg_discount_from_loadboard < 10,
      sub: 'below loadboard',
    },
    {
      label: 'Avg Duration',
      value: formatDuration(metrics.avg_call_duration_seconds),
      up: metrics.avg_call_duration_seconds < 240,
    },
  ];

  return (
    <div className="flex items-center gap-0 px-4 h-12 overflow-x-auto">
      {kpis.map((kpi, i) => (
        <div key={i} className="flex items-center flex-shrink-0">
          {i > 0 && <div className="h-5 w-px bg-border mx-4" />}
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">{kpi.label}</span>
            <span className="text-sm font-semibold tabular-nums whitespace-nowrap">{kpi.value}</span>
            {kpi.up
              ? <TrendingUp className="h-3 w-3 text-primary flex-shrink-0" />
              : <TrendingDown className="h-3 w-3 text-warning flex-shrink-0" />}
          </div>
        </div>
      ))}
    </div>
  );
}
