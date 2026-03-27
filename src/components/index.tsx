/* ============================================
   ACME Logistics Dashboard — Components
   ============================================ */

import { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import type { CallRecord, DashboardMetrics, OutcomeDistribution, ConnectionStatus } from '../types';
import {
  formatDuration,
  formatTimestamp,
  formatCurrency,
  formatPercentage,
  getOutcomeConfig,
  getSentimentConfig,
  CHART_COLORS,
  cn,
} from '../utils';

// ── Status Indicator ──

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const statusText = {
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Error',
  };

  const isConnected = status === 'connected';

  return (
    <div className="status-indicator">
      <span className={cn('status-dot', !isConnected && 'disconnected')} />
      <span>{statusText[status]}</span>
    </div>
  );
}

// ── Metric Card ──

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive?: boolean };
  variant?: 'default' | 'accent' | 'warning' | 'danger';
  valueClass?: string;
}

export function MetricCard({
  label,
  value,
  subtitle,
  trend,
  variant = 'default',
  valueClass,
}: MetricCardProps) {
  return (
    <div className={cn('metric-card', variant !== 'default' && variant)}>
      <div className="metric-label">{label}</div>
      <div className={cn('metric-value', valueClass)}>{value}</div>
      {(subtitle || trend) && (
        <div className={cn('metric-change', trend?.positive && 'positive')}>
          {trend ? trend.value : subtitle}
        </div>
      )}
    </div>
  );
}

// ── Metrics Grid ──

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="metrics-grid">
      <MetricCard
        label="Total Calls"
        value={metrics.total_calls}
        subtitle="Today's volume"
      />
      <MetricCard
        label="Loads Booked"
        value={metrics.successful_bookings}
        variant="accent"
        valueClass="success"
        trend={{
          value: metrics.successful_bookings > 0 
            ? `↑ ${metrics.successful_bookings} today` 
            : '— No bookings yet',
          positive: metrics.successful_bookings > 0,
        }}
      />
      <MetricCard
        label="Conversion Rate"
        value={formatPercentage(metrics.conversion_rate)}
        variant="accent"
        subtitle="Calls → Bookings"
      />
      <MetricCard
        label="Transfers to Rep"
        value={metrics.transfers_to_rep}
        subtitle="Price agreed → handoff"
      />
      <MetricCard
        label="Avg Call Duration"
        value={formatDuration(Math.round(metrics.avg_call_duration_seconds))}
        subtitle="Minutes:seconds"
      />
      <MetricCard
        label="Negotiation Rounds"
        value={metrics.avg_negotiation_rounds.toFixed(1)}
        subtitle="Avg per call (max 3)"
      />
      <MetricCard
        label="Revenue Booked"
        value={formatCurrency(metrics.total_revenue_booked)}
        variant="accent"
        valueClass="success"
        trend={{ value: 'Total confirmed', positive: true }}
      />
      <MetricCard
        label="Avg Discount"
        value={formatPercentage(metrics.avg_discount_from_loadboard)}
        variant="warning"
        valueClass="warning"
        subtitle="From loadboard rate"
      />
    </div>
  );
}

// ── Outcome Badge ──

interface OutcomeBadgeProps {
  outcome: string;
}

export function OutcomeBadge({ outcome }: OutcomeBadgeProps) {
  const config = getOutcomeConfig(outcome as any);
  return (
    <span className={cn('badge', config.className)}>
      {config.icon} {config.label}
    </span>
  );
}

// ── Sentiment Badge ──

interface SentimentBadgeProps {
  sentiment: string;
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const config = getSentimentConfig(sentiment as any);
  return (
    <span className={cn('badge', config.className)}>
      {config.emoji} {config.label}
    </span>
  );
}

// ── Calls Table ──

interface CallsTableProps {
  calls: CallRecord[];
}

export function CallsTable({ calls }: CallsTableProps) {
  if (!calls || calls.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📞</div>
        <h3>No calls recorded yet</h3>
        <p>Inbound carrier calls will appear here in real-time as they are processed by the AI agent.</p>
        <code>POST /api/v1/demo/generate-calls</code>
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Carrier</th>
          <th>MC Number</th>
          <th>Load ID</th>
          <th>Outcome</th>
          <th>Sentiment</th>
          <th>Duration</th>
          <th>Final Rate</th>
        </tr>
      </thead>
      <tbody>
        {calls.map((call) => (
          <tr key={call.id}>
            <td>{formatTimestamp(call.timestamp)}</td>
            <td><strong>{call.carrier_name || '—'}</strong></td>
            <td><code>{call.carrier_mc || '—'}</code></td>
            <td><code>{call.load_id || '—'}</code></td>
            <td><OutcomeBadge outcome={call.outcome} /></td>
            <td><SentimentBadge sentiment={call.sentiment} /></td>
            <td>{formatDuration(call.duration_seconds)}</td>
            <td><strong>{formatCurrency(call.final_rate)}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Outcomes Chart ──

interface OutcomesChartProps {
  distribution: OutcomeDistribution;
}

export function OutcomesChart({ distribution }: OutcomesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labelMap: Record<string, string> = {
      load_booked: 'Booked',
      price_agreed_transfer: 'Transfer',
      no_agreement: 'No Agreement',
      carrier_not_interested: 'Not Interested',
      carrier_ineligible: 'Ineligible',
      no_matching_loads: 'No Loads',
      call_dropped: 'Dropped',
      carrier_hung_up: 'Hung Up',
      max_negotiations_reached: 'Max Rounds',
    };

    const labels = Object.keys(distribution).map((k) => labelMap[k] || k);
    const data = Object.values(distribution);
    const colors = Object.keys(distribution).map(
      (k) => CHART_COLORS[k as keyof typeof CHART_COLORS] || '#A3A3A3'
    );

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderRadius: 6,
          maxBarThickness: 48,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A1A1A',
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: '#F5F5F4' },
          },
          x: {
            ticks: { maxRotation: 45, minRotation: 45 },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [distribution]);

  return <canvas ref={canvasRef} />;
}

// ── Sentiment Chart ──

interface SentimentChartProps {
  positive: number;
  neutral: number;
  negative: number;
}

export function SentimentChart({ positive, neutral, negative }: SentimentChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const total = positive + neutral + negative;

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    if (total === 0) {
      ctx.font = '14px Inter';
      ctx.fillStyle = '#A3A3A3';
      ctx.textAlign = 'center';
      ctx.fillText('No sentiment data yet', canvasRef.current.width / 2, canvasRef.current.height / 2);
      return;
    }

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
          data: [positive, neutral, negative],
          backgroundColor: [CHART_COLORS.positive, CHART_COLORS.neutral, CHART_COLORS.negative],
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: '#1A1A1A',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const pct = ((context.raw as number / total) * 100).toFixed(1);
                return `${context.label}: ${context.raw} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [positive, neutral, negative, total]);

  return <canvas ref={canvasRef} />;
}

// ── Loading Spinner ──

interface LoadingProps {
  text?: string;
}

export function Loading({ text = 'Loading...' }: LoadingProps) {
  return (
    <div className="loading">
      <div className="spinner" />
      <span className="loading-text">{text}</span>
    </div>
  );
}

// ── Icon Components ──

export function RefreshIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}

export function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
