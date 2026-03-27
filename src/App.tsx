import { useState, useCallback } from 'react';
import {
  Bar,
  BarChart,
  XAxis,
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { useDashboardData, useGenerateDemoData } from './hooks';
import type { DashboardMetrics, OutcomeDistribution, CallRecord } from './types';
import { formatCurrency, formatDuration, formatPercentage, formatTimestamp, getOutcomeConfig, getSentimentConfig } from './utils';
import acmeLogo from './assets/acme_logistics_inc_logo.jpeg';
import './styles/globals.css';

// ============================================================================
// KPI Card Component (professional with hover effects)
// ============================================================================
function KPICard({
  title,
  value,
  trend,
  trendUp,
  subtitle,
  description,
}: {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-xl border bg-card text-card-foreground shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 cursor-default">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border transition-colors ${
            trendUp 
              ? 'text-emerald-600 border-emerald-200/60 bg-emerald-50/50 group-hover:bg-emerald-50' 
              : 'text-rose-600 border-rose-200/60 bg-rose-50/50 group-hover:bg-rose-50'
          }`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
        </div>
        <div className="text-3xl font-semibold tracking-tight mb-3">{value}</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            {subtitle}
            {trendUp ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            )}
          </div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Bar Chart Component (professional with hover)
// ============================================================================
function OutcomesBarChart({ distribution }: { distribution: OutcomeDistribution }) {
  const chartData = [
    { month: 'Booked', success: distribution.load_booked || 0, other: distribution.price_agreed_transfer || 0 },
    { month: 'No Deal', success: distribution.no_agreement || 0, other: distribution.carrier_not_interested || 0 },
    { month: 'Failed', success: distribution.carrier_ineligible || 0, other: distribution.call_dropped || 0 },
    { month: 'Other', success: distribution.no_matching_loads || 0, other: distribution.carrier_hung_up || 0 },
  ];

  const totalCalls = Object.values(distribution).reduce((a, b) => a + (b || 0), 0);
  const bookedCalls = (distribution.load_booked || 0) + (distribution.price_agreed_transfer || 0);
  const conversionRate = totalCalls > 0 ? ((bookedCalls / totalCalls) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Call Outcomes
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border ${
                Number(conversionRate) > 20 ? 'text-emerald-600 border-emerald-200/60' : 'text-amber-600 border-amber-200/60'
              }`}>
                {Number(conversionRate) > 20 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {conversionRate}%
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">Breakdown by result type</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
              <span className="text-muted-foreground">Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px)' }} />
              <span className="text-muted-foreground">Other</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <defs>
                <pattern id="hatchPattern" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(-45)">
                  <rect width="2" height="4" fill="#3b82f6" />
                </pattern>
              </defs>
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="success" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="other" fill="url(#hatchPattern)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Recent Calls Component (professional with hover on items)
// ============================================================================
function RecentCallsList({ calls }: { calls: CallRecord[] }) {
  const recentCalls = calls.slice(0, 5);

  const getInitials = (name: string) => {
    if (!name) return 'CA';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-4">
        <h3 className="font-semibold">Recent Calls</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Latest {recentCalls.length} carrier interactions</p>
      </div>
      <div className="px-6 pb-6">
        <div className="space-y-1">
          {recentCalls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No calls recorded yet</p>
            </div>
          ) : (
            recentCalls.map((call, index) => (
              <div 
                key={call.id} 
                className="flex items-center gap-4 p-3 -mx-3 rounded-lg transition-colors hover:bg-muted/50 cursor-default"
              >
                <div className={`h-9 w-9 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white text-xs font-medium shadow-sm`}>
                  {getInitials(call.carrier_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{call.carrier_name || 'Unknown Carrier'}</p>
                  <p className="text-xs text-muted-foreground mt-1">MC# {call.carrier_mc || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{formatCurrency(call.final_rate)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Area Chart Component (professional styling)
// ============================================================================
function CallTrendsAreaChart({ calls }: { calls: CallRecord[] }) {
  // Group calls by hour
  const callsByHour = calls.reduce((acc, call) => {
    const hour = new Date(call.timestamp).getHours();
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
    if (!acc[hourLabel]) acc[hourLabel] = { hour: hourLabel, total: 0, booked: 0 };
    acc[hourLabel].total += 1;
    if (call.outcome === 'load_booked' || call.outcome === 'price_agreed_transfer') {
      acc[hourLabel].booked += 1;
    }
    return acc;
  }, {} as Record<string, { hour: string; total: number; booked: number }>);

  const chartData = Object.values(callsByHour).sort((a, b) => a.hour.localeCompare(b.hour));
  
  // Use sample data if no real data
  const displayData = chartData.length > 0 ? chartData : [
    { hour: '09:00', total: 8, booked: 3 },
    { hour: '10:00', total: 12, booked: 5 },
    { hour: '11:00', total: 15, booked: 6 },
    { hour: '12:00', total: 10, booked: 4 },
    { hour: '13:00', total: 18, booked: 7 },
    { hour: '14:00', total: 14, booked: 5 },
    { hour: '15:00', total: 16, booked: 6 },
    { hour: '16:00', total: 11, booked: 4 },
  ];

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Call Volume
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-emerald-600 border-emerald-200/60">
                <TrendingUp className="h-3 w-3" />
                Live
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">Hourly call distribution</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" />
              <span className="text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#22c55e]" />
              <span className="text-muted-foreground">Booked</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="hour" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#colorTotal)" strokeWidth={2} />
              <Area type="monotone" dataKey="booked" stroke="#22c55e" fill="url(#colorBooked)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Pie Chart Component (professional styling)
// ============================================================================
function SentimentPieChart({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  const total = positive + neutral + negative;
  const positiveRate = total > 0 ? ((positive / total) * 100).toFixed(0) : '0';

  const chartData = [
    { name: 'Positive', value: positive, fill: '#22c55e' },
    { name: 'Neutral', value: neutral, fill: '#6b7280' },
    { name: 'Negative', value: negative, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2 text-center">
        <h3 className="font-semibold flex items-center justify-center gap-2">
          Carrier Sentiment
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border ${
            Number(positiveRate) >= 50 ? 'text-emerald-600 border-emerald-200/60' : 'text-amber-600 border-amber-200/60'
          }`}>
            {Number(positiveRate) >= 50 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positiveRate}% positive
          </span>
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">AI-classified mood analysis</p>
      </div>
      <div className="p-6 pt-0 flex flex-col items-center">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                cornerRadius={4}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList dataKey="value" position="inside" fill="white" fontSize={11} fontWeight={600} />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-5 mt-3">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo Data (shown when API is not connected)
// ============================================================================
const DEMO_METRICS: DashboardMetrics = {
  total_calls: 127,
  successful_bookings: 34,
  conversion_rate: 26.8,
  transfers_to_rep: 12,
  avg_call_duration_seconds: 185,
  avg_negotiation_rounds: 2.1,
  total_revenue_booked: 48750,
  avg_discount_from_loadboard: 8.5,
  sentiment_positive: 65,
  sentiment_neutral: 42,
  sentiment_negative: 20,
};

const DEMO_DISTRIBUTION: OutcomeDistribution = {
  load_booked: 34,
  price_agreed_transfer: 12,
  no_agreement: 28,
  carrier_not_interested: 18,
  carrier_ineligible: 8,
  no_matching_loads: 15,
  call_dropped: 5,
  carrier_hung_up: 4,
  max_negotiations_reached: 3,
};

const DEMO_CALLS: CallRecord[] = [
  { id: '1', timestamp: new Date().toISOString(), carrier_name: 'Swift Transport LLC', carrier_mc: '482910', load_id: 'LD-2024-001', outcome: 'load_booked', sentiment: 'positive', duration_seconds: 245, negotiation_rounds: 2, initial_rate: 2800, final_rate: 2650, discount_percentage: 5.4, transfer_successful: true },
  { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), carrier_name: 'Midwest Freight Co', carrier_mc: '391827', load_id: 'LD-2024-002', outcome: 'price_agreed_transfer', sentiment: 'eager', duration_seconds: 312, negotiation_rounds: 3, initial_rate: 3200, final_rate: 2950, discount_percentage: 7.8, transfer_successful: true },
  { id: '3', timestamp: new Date(Date.now() - 7200000).toISOString(), carrier_name: 'Pacific Haulers Inc', carrier_mc: '519283', load_id: 'LD-2024-003', outcome: 'no_agreement', sentiment: 'neutral', duration_seconds: 180, negotiation_rounds: 3, initial_rate: 2400, final_rate: null, discount_percentage: null, transfer_successful: false },
  { id: '4', timestamp: new Date(Date.now() - 10800000).toISOString(), carrier_name: 'Eastern Express', carrier_mc: '628194', load_id: 'LD-2024-004', outcome: 'load_booked', sentiment: 'very_positive', duration_seconds: 198, negotiation_rounds: 1, initial_rate: 1850, final_rate: 1850, discount_percentage: 0, transfer_successful: true },
  { id: '5', timestamp: new Date(Date.now() - 14400000).toISOString(), carrier_name: 'Summit Logistics', carrier_mc: '738291', load_id: null, outcome: 'carrier_ineligible', sentiment: 'negative', duration_seconds: 95, negotiation_rounds: 0, initial_rate: null, final_rate: null, discount_percentage: null, transfer_successful: false },
];

// ============================================================================
// Main App Component
// ============================================================================
export default function App() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const { data, status, refresh, isLoading } = useDashboardData({ apiUrl });
  const { generate, isGenerating } = useGenerateDemoData(apiUrl);

  const handleGenerateDemo = useCallback(async () => {
    const success = await generate(10);
    if (success) setTimeout(refresh, 500);
  }, [generate, refresh]);

  // Use real data if available, otherwise use demo data
  const metrics = data?.metrics || DEMO_METRICS;
  const outcomeDistribution = data?.outcome_distribution || DEMO_DISTRIBUTION;
  const recentCalls = data?.recent_calls || DEMO_CALLS;

  // KPI data derived from metrics
  const kpiCards = [
    {
      title: 'Total Calls',
      value: metrics.total_calls.toString(),
      trend: `+${metrics.total_calls}`,
      trendUp: metrics.total_calls > 0,
      subtitle: 'Carriers processed today',
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
      trend: metrics.conversion_rate > 15 ? '+' + formatPercentage(metrics.conversion_rate - 15) : formatPercentage(metrics.conversion_rate - 15),
      trendUp: metrics.conversion_rate > 15,
      subtitle: 'Calls to bookings',
      description: 'Industry avg: 15%',
    },
    {
      title: 'Revenue',
      value: formatCurrency(metrics.total_revenue_booked),
      trend: metrics.total_revenue_booked > 0 ? 'Active' : 'Pending',
      trendUp: metrics.total_revenue_booked > 0,
      subtitle: 'Total confirmed value',
      description: 'From matched loads',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src={acmeLogo} alt="ACME" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-semibold">ACME Logistics</span>
            <span className="text-xs px-2 py-0.5 rounded border bg-muted text-muted-foreground">Voice AI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
              status === 'connected' ? 'bg-emerald-100 text-emerald-700' :
              status === 'connecting' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                status === 'connected' ? 'bg-emerald-500 animate-pulse' :
                status === 'connecting' ? 'bg-amber-500 animate-pulse' :
                'bg-rose-500'
              }`} />
              {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Demo Mode'}
            </span>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 h-8 px-3 text-sm rounded-md border bg-background hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleGenerateDemo}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 h-8 px-3 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Demo Calls'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time carrier sales performance and analytics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card, i) => <KPICard key={i} {...card} />)}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-4">
          <div className="lg:col-span-4">
            <OutcomesBarChart distribution={outcomeDistribution} />
          </div>
          <div className="lg:col-span-3">
            <RecentCallsList calls={recentCalls} />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <div className="lg:col-span-4">
            <CallTrendsAreaChart calls={recentCalls} />
          </div>
          <div className="lg:col-span-3">
            <SentimentPieChart
              positive={metrics.sentiment_positive}
              neutral={metrics.sentiment_neutral}
              negative={metrics.sentiment_negative}
            />
          </div>
        </div>
      </main>
    </div>
  );
}