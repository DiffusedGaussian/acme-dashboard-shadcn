import { TrendingUp, TrendingDown, Clock, ShieldCheck, Repeat2, Percent } from 'lucide-react';
import type { DashboardMetrics, OutcomeDistribution } from '../../types';
import { formatDuration, formatPercentage } from '../../utils';

// ── KPI Card — primary metric with trend badge ──

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  subtitle: string;
  description: string;
}

export function KPICard({ title, value, trend, trendUp, subtitle, description }: KPICardProps) {
  return (
    <div className="group relative rounded-xl border bg-card text-card-foreground shadow-sm p-3.5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 cursor-default">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-px rounded border transition-colors ${
            trendUp
              ? 'text-primary border-primary/20 bg-primary/5'
              : 'text-warning border-warning/20 bg-warning/5'
          }`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
        </div>
        <div className="text-2xl font-semibold tracking-tight mb-1.5">{value}</div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-foreground/80">
            {subtitle}
            {trendUp
              ? <TrendingUp className="h-3 w-3 text-primary" />
              : <TrendingDown className="h-3 w-3 text-warning" />}
          </div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card — secondary metric with icon, no trend arrow ──

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function StatCard({ title, value, subtitle, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-3.5 transition-all duration-200 hover:shadow-md cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-semibold tracking-tight mt-0.5">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground/50 mt-0.5" />
      </div>
    </div>
  );
}

// ── Composed KPI rows for the dashboard ──

interface DashboardKPIsProps {
  metrics: DashboardMetrics;
  distribution: OutcomeDistribution;
}

export function DashboardKPIs({ metrics, distribution }: DashboardKPIsProps) {
  const totalCalls = Object.values(distribution).reduce((a, b) => a + (b || 0), 0);
  const ineligibleCount = distribution.carrier_ineligible || 0;
  const fmcsaPassRate = totalCalls > 0 ? (((totalCalls - ineligibleCount) / totalCalls) * 100).toFixed(0) : '—';

  const primaryKPIs = [
    {
      title: 'Total Calls',
      value: metrics.total_calls.toString(),
      trend: `+${metrics.total_calls}`,
      trendUp: metrics.total_calls > 0,
      subtitle: 'Carriers processed',
      description: 'Inbound call volume',
    },
    {
      title: 'Loads Booked',
      value: metrics.successful_bookings.toString(),
      trend: `+${metrics.successful_bookings}`,
      trendUp: metrics.successful_bookings > 0,
      subtitle: 'Successfully matched',
      description: 'Confirmed shipments',
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(metrics.conversion_rate),
      trend: metrics.conversion_rate > 15
        ? `+${(metrics.conversion_rate - 15).toFixed(1)}% vs avg`
        : `${(metrics.conversion_rate - 15).toFixed(1)}% vs avg`,
      trendUp: metrics.conversion_rate > 15,
      subtitle: 'Calls to bookings',
      description: 'Industry avg: 15%',
    },
    {
      title: 'Revenue Booked',
      value: `$${(metrics.total_revenue_booked / 1000).toFixed(1)}k`,
      trend: metrics.total_revenue_booked > 0 ? 'Active' : 'Pending',
      trendUp: metrics.total_revenue_booked > 0,
      subtitle: 'Total confirmed value',
      description: 'From matched loads',
    },
  ];

  const secondaryStats = [
    { title: 'Avg Negotiation Rounds', value: metrics.avg_negotiation_rounds.toFixed(1), subtitle: 'Counter-offers per deal', icon: Repeat2 },
    { title: 'Avg Rate Discount', value: formatPercentage(metrics.avg_discount_from_loadboard), subtitle: 'Below loadboard rate', icon: Percent },
    { title: 'FMCSA Pass Rate', value: `${fmcsaPassRate}%`, subtitle: `${ineligibleCount} ineligible carriers`, icon: ShieldCheck },
    { title: 'Avg Call Duration', value: formatDuration(metrics.avg_call_duration_seconds), subtitle: `${metrics.transfers_to_rep} transferred to rep`, icon: Clock },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {primaryKPIs.map((card, i) => <KPICard key={i} {...card} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {secondaryStats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>
    </>
  );
}
