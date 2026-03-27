import { useState, useCallback } from 'react';
import {
  Bar, BarChart, XAxis, YAxis, Area, AreaChart, CartesianGrid,
  Pie, PieChart, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { TrendingUp, TrendingDown, RefreshCw, Plus, Clock, ShieldCheck, Repeat2, Percent } from 'lucide-react';
import { useDashboardData, useGenerateDemoData } from './hooks';
import type { DashboardMetrics, OutcomeDistribution, CallRecord } from './types';
import {
  formatCurrency, formatPercentage, formatDuration, formatTimestamp,
  getOutcomeConfig, getSentimentConfig,
} from './utils';
import acmeLogo from './assets/acme_logistics_inc_logo.jpeg';
import './styles/globals.css';

// ============================================================================
// KPI Card — primary metric with trend
// ============================================================================
function KPICard({ title, value, trend, trendUp, subtitle, description }: {
  title: string; value: string; trend: string; trendUp: boolean;
  subtitle: string; description: string;
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
            {trendUp
              ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
          </div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stat Card — secondary metric, no trend arrow
// ============================================================================
function StatCard({ title, value, subtitle, icon: Icon }: {
  title: string; value: string; subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 transition-all duration-200 hover:shadow-md cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground/50 mt-0.5" />
      </div>
    </div>
  );
}

// ============================================================================
// Outcomes Bar Chart
// ============================================================================
function OutcomesBarChart({ distribution }: { distribution: OutcomeDistribution }) {
  const chartData = [
    { name: 'Booked', success: distribution.load_booked || 0, other: distribution.price_agreed_transfer || 0 },
    { name: 'No Deal', success: distribution.no_agreement || 0, other: distribution.carrier_not_interested || 0 },
    { name: 'Failed', success: distribution.carrier_ineligible || 0, other: distribution.call_dropped || 0 },
    { name: 'Other', success: distribution.no_matching_loads || 0, other: distribution.carrier_hung_up || 0 },
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
                {conversionRate}% conversion
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">Breakdown by result type</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
              <span className="text-muted-foreground">Primary</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" />
              <span className="text-muted-foreground">Secondary</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="success" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="other" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Negotiation Funnel Chart — rounds 1/2/3 booked vs no-deal
// ============================================================================
function NegotiationFunnelChart({ calls }: { calls: CallRecord[] }) {
  const negotiated = calls.filter(c => c.negotiation_rounds > 0);

  const data = [1, 2, 3].map(round => {
    const atRound = negotiated.filter(c => c.negotiation_rounds === round);
    const agreed = atRound.filter(c => c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer').length;
    const noDeal = atRound.length - agreed;
    return { round: `Round ${round}`, agreed, noDeal };
  });

  const totalNegotiated = negotiated.length;
  const closedViaNegs = negotiated.filter(c => c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer').length;
  const negsCloseRate = totalNegotiated > 0 ? ((closedViaNegs / totalNegotiated) * 100).toFixed(0) : '0';

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Negotiation Funnel
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-violet-600 border-violet-200/60">
                <Repeat2 className="h-3 w-3" />
                {negsCloseRate}% close rate
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">Deals agreed vs. no-deal by counter-offer round</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#22c55e]" />
              <span className="text-muted-foreground">Agreed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#f87171]" />
              <span className="text-muted-foreground">No Deal</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="round" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                formatter={(value, name) => [value, name === 'agreed' ? 'Deal Agreed' : 'No Deal']}
              />
              <Bar dataKey="agreed" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="noDeal" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Rate Walk Chart — loadboard rate vs agreed rate per booked call
// ============================================================================
function RateWalkChart({ calls }: { calls: CallRecord[] }) {
  const booked = calls
    .filter(c => (c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer') && c.initial_rate && c.final_rate)
    .slice(-10);

  const data = booked.map((c, i) => ({
    name: c.carrier_name?.split(' ')[0] || `#${i + 1}`,
    offered: c.initial_rate,
    agreed: c.final_rate,
  }));

  const avgSavings = booked.length > 0
    ? (booked.reduce((sum, c) => sum + (c.discount_percentage || 0), 0) / booked.length).toFixed(1)
    : '0';

  const fallback = [
    { name: 'Swift', offered: 2800, agreed: 2650 },
    { name: 'Midwest', offered: 3200, agreed: 2950 },
    { name: 'Pacific', offered: 2400, agreed: 2350 },
    { name: 'Eastern', offered: 1850, agreed: 1850 },
    { name: 'Summit', offered: 3100, agreed: 2900 },
  ];
  const displayData = data.length > 0 ? data : fallback;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Rate Walk
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-amber-600 border-amber-200/60">
                <Percent className="h-3 w-3" />
                avg {avgSavings}% off
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">Offered vs. agreed rate per booked load</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#94a3b8]" />
              <span className="text-muted-foreground">Offered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
              <span className="text-muted-foreground">Agreed</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Bar dataKey="offered" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="agreed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Call Volume Area Chart
// ============================================================================
function CallTrendsAreaChart({ calls }: { calls: CallRecord[] }) {
  const callsByHour = calls.reduce((acc, call) => {
    const hour = new Date(call.timestamp).getHours();
    const label = `${hour.toString().padStart(2, '0')}:00`;
    if (!acc[label]) acc[label] = { hour: label, total: 0, booked: 0 };
    acc[label].total += 1;
    if (call.outcome === 'load_booked' || call.outcome === 'price_agreed_transfer') acc[label].booked += 1;
    return acc;
  }, {} as Record<string, { hour: string; total: number; booked: number }>);

  const chartData = Object.values(callsByHour).sort((a, b) => a.hour.localeCompare(b.hour));
  const displayData = chartData.length > 0 ? chartData : [
    { hour: '09:00', total: 8, booked: 3 }, { hour: '10:00', total: 12, booked: 5 },
    { hour: '11:00', total: 15, booked: 6 }, { hour: '12:00', total: 10, booked: 4 },
    { hour: '13:00', total: 18, booked: 7 }, { hour: '14:00', total: 14, booked: 5 },
    { hour: '15:00', total: 16, booked: 6 }, { hour: '16:00', total: 11, booked: 4 },
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
            <p className="text-sm text-muted-foreground mt-0.5">Hourly inbound call distribution</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" /><span className="text-muted-foreground">Total</span></div>
            <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-sm bg-[#22c55e]" /><span className="text-muted-foreground">Booked</span></div>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
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
// Sentiment Pie Chart
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
        <p className="text-sm text-muted-foreground mt-0.5">AI-classified mood per call</p>
      </div>
      <div className="p-6 pt-0 flex flex-col items-center">
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" cornerRadius={4}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-5 mt-2">
          {chartData.map(item => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-muted-foreground">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Network Explorer — US lane map
// ============================================================================
const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const CITY_COORDS: Record<string, [number, number]> = {
  'Dallas':        [-96.797,  32.776],
  'Atlanta':       [-84.388,  33.749],
  'Chicago':       [-87.629,  41.878],
  'Denver':        [-104.990, 39.739],
  'Houston':       [-95.370,  29.760],
  'Phoenix':       [-112.074, 33.449],
  'Los Angeles':   [-118.243, 34.052],
  'Seattle':       [-122.332, 47.606],
  'Miami':         [-80.192,  25.775],
  'New York':      [-74.006,  40.712],
  'Nashville':     [-86.781,  36.163],
  'Memphis':       [-90.048,  35.150],
  'Portland':      [-122.676, 45.523],
  'San Francisco': [-122.419, 37.775],
  'Kansas City':   [-94.579,  39.100],
  'Minneapolis':   [-93.265,  44.978],
};

// All lanes available in the load database (always shown faintly)
const ALL_LANES: Array<{ from: string; to: string }> = [
  { from: 'Dallas',       to: 'Atlanta'       },
  { from: 'Chicago',      to: 'Denver'        },
  { from: 'Houston',      to: 'Phoenix'       },
  { from: 'Los Angeles',  to: 'Seattle'       },
  { from: 'Miami',        to: 'New York'      },
  { from: 'Atlanta',      to: 'Dallas'        },
  { from: 'Nashville',    to: 'Memphis'       },
  { from: 'Portland',     to: 'San Francisco' },
  { from: 'Kansas City',  to: 'Minneapolis'   },
];

function NetworkExplorer({ calls }: { calls: CallRecord[] }) {
  // Booked route frequencies
  const bookedRoutes = calls
    .filter(c =>
      (c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer') &&
      c.origin_city && c.destination_city
    )
    .reduce((acc, c) => {
      const key = `${c.origin_city}→${c.destination_city}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // City activity (calls mentioning that city)
  const cityActivity = calls.reduce((acc, c) => {
    if (c.origin_city)      acc[c.origin_city]      = (acc[c.origin_city]      || 0) + 1;
    if (c.destination_city) acc[c.destination_city] = (acc[c.destination_city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalBooked = Object.values(bookedRoutes).reduce((a, b) => a + b, 0);
  const activeLanes = Object.keys(bookedRoutes).length;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-semibold">Network Explorer</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Active freight lanes · {activeLanes} lanes · {totalBooked} bookings
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-6 bg-border rounded" />
              <span className="text-muted-foreground">Available lane</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-6 bg-amber-400 rounded" />
              <span className="text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">City activity</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: '380px' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              (geographies as Array<{ rsmKey: string }>).map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth={0.6}
                  style={{ outline: 'none' }}
                />
              ))
            }
          </Geographies>

          {/* All available lanes — faint */}
          {ALL_LANES.map(({ from, to }) => {
            const fromCoords = CITY_COORDS[from];
            const toCoords   = CITY_COORDS[to];
            if (!fromCoords || !toCoords) return null;
            return (
              <Line
                key={`avail-${from}-${to}`}
                from={fromCoords}
                to={toCoords}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                strokeOpacity={0.8}
              />
            );
          })}

          {/* Booked routes — highlighted, thicker by volume */}
          {Object.entries(bookedRoutes).map(([key, count]) => {
            const [from, to] = key.split('→');
            const fromCoords = CITY_COORDS[from];
            const toCoords   = CITY_COORDS[to];
            if (!fromCoords || !toCoords) return null;
            return (
              <Line
                key={`booked-${key}`}
                from={fromCoords}
                to={toCoords}
                stroke="#f59e0b"
                strokeWidth={Math.min(1 + count, 4)}
                strokeOpacity={0.85}
              />
            );
          })}

          {/* City markers */}
          {Object.entries(CITY_COORDS).map(([city, coords]) => {
            const activity = cityActivity[city] || 0;
            const r = activity > 0 ? Math.min(3 + activity * 1.2, 10) : 3;
            const fill = activity > 0 ? '#3b82f6' : 'hsl(var(--muted-foreground))';
            const opacity = activity > 0 ? 0.85 : 0.3;
            return (
              <Marker key={city} coordinates={coords}>
                <circle r={r} fill={fill} fillOpacity={opacity} stroke="#fff" strokeWidth={0.8} />
              </Marker>
            );
          })}
        </ComposableMap>
      </div>
    </div>
  );
}

// ============================================================================
// Calls Table — full extracted data per call
// ============================================================================
function CallsTable({ calls }: { calls: CallRecord[] }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-4">
        <h3 className="font-semibold">Call Log</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Extracted data from every carrier interaction</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 whitespace-nowrap">Time</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Carrier</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Load</th>
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
                return (
                  <tr key={call.id} className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-6 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatTimestamp(call.timestamp)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-sm">{call.carrier_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">MC# {call.carrier_mc || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{call.load_id || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${
                        isBooked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                        isFailed ? 'bg-rose-50 text-rose-700 border border-rose-200/60' :
                        'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}>
                        {outcome.icon} {outcome.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm">{sentiment.emoji} <span className="text-xs text-muted-foreground">{sentiment.label}</span></span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {call.negotiation_rounds > 0 ? (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                          {call.negotiation_rounds}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground whitespace-nowrap">{formatCurrency(call.initial_rate)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums font-medium whitespace-nowrap">{formatCurrency(call.final_rate)}</td>
                    <td className="px-4 py-3 text-right text-xs whitespace-nowrap">
                      {call.discount_percentage != null && call.discount_percentage > 0 ? (
                        <span className="text-rose-600">-{call.discount_percentage.toFixed(1)}%</span>
                      ) : call.discount_percentage === 0 ? (
                        <span className="text-muted-foreground">0%</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 pr-6 text-right text-xs text-muted-foreground whitespace-nowrap">{formatDuration(call.duration_seconds)}</td>
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

// ============================================================================
// Demo Data
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
  load_booked: 34, price_agreed_transfer: 12, no_agreement: 28,
  carrier_not_interested: 18, carrier_ineligible: 8, no_matching_loads: 15,
  call_dropped: 5, carrier_hung_up: 4, max_negotiations_reached: 3,
};

const DEMO_CALLS: CallRecord[] = [
  { id: '1', timestamp: new Date().toISOString(), carrier_name: 'Swift Transport LLC', carrier_mc: '482910', load_id: 'LD-001', outcome: 'load_booked', sentiment: 'positive', duration_seconds: 245, negotiation_rounds: 2, initial_rate: 2800, final_rate: 2650, discount_percentage: 5.4, transfer_successful: true, origin_city: 'Dallas', origin_state: 'TX', destination_city: 'Atlanta', destination_state: 'GA' },
  { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), carrier_name: 'Midwest Freight Co', carrier_mc: '391827', load_id: 'LD-002', outcome: 'price_agreed_transfer', sentiment: 'eager', duration_seconds: 312, negotiation_rounds: 3, initial_rate: 3200, final_rate: 2950, discount_percentage: 7.8, transfer_successful: true, origin_city: 'Chicago', origin_state: 'IL', destination_city: 'Denver', destination_state: 'CO' },
  { id: '3', timestamp: new Date(Date.now() - 7200000).toISOString(), carrier_name: 'Pacific Haulers Inc', carrier_mc: '519283', load_id: 'LD-003', outcome: 'no_agreement', sentiment: 'neutral', duration_seconds: 180, negotiation_rounds: 3, initial_rate: 2400, final_rate: null, discount_percentage: null, transfer_successful: false, origin_city: null, origin_state: null, destination_city: null, destination_state: null },
  { id: '4', timestamp: new Date(Date.now() - 10800000).toISOString(), carrier_name: 'Eastern Express', carrier_mc: '628194', load_id: 'LD-004', outcome: 'load_booked', sentiment: 'very_positive', duration_seconds: 198, negotiation_rounds: 1, initial_rate: 1850, final_rate: 1850, discount_percentage: 0, transfer_successful: true, origin_city: 'Los Angeles', origin_state: 'CA', destination_city: 'Seattle', destination_state: 'WA' },
  { id: '5', timestamp: new Date(Date.now() - 14400000).toISOString(), carrier_name: 'Summit Logistics', carrier_mc: '738291', load_id: null, outcome: 'carrier_ineligible', sentiment: 'negative', duration_seconds: 95, negotiation_rounds: 0, initial_rate: null, final_rate: null, discount_percentage: null, transfer_successful: false, origin_city: null, origin_state: null, destination_city: null, destination_state: null },
  { id: '6', timestamp: new Date(Date.now() - 18000000).toISOString(), carrier_name: 'Blue Ridge Trucking', carrier_mc: '847392', load_id: 'LD-005', outcome: 'load_booked', sentiment: 'positive', duration_seconds: 220, negotiation_rounds: 1, initial_rate: 3800, final_rate: 3650, discount_percentage: 3.9, transfer_successful: true, origin_city: 'Miami', origin_state: 'FL', destination_city: 'New York', destination_state: 'NY' },
  { id: '7', timestamp: new Date(Date.now() - 21600000).toISOString(), carrier_name: 'Lone Star Carriers', carrier_mc: '956483', load_id: null, outcome: 'no_matching_loads', sentiment: 'neutral', duration_seconds: 78, negotiation_rounds: 0, initial_rate: null, final_rate: null, discount_percentage: null, transfer_successful: false, origin_city: null, origin_state: null, destination_city: null, destination_state: null },
  { id: '8', timestamp: new Date(Date.now() - 25200000).toISOString(), carrier_name: 'Great Lakes Transit', carrier_mc: '104857', load_id: 'LD-006', outcome: 'price_agreed_transfer', sentiment: 'eager', duration_seconds: 290, negotiation_rounds: 2, initial_rate: 2100, final_rate: 1980, discount_percentage: 5.7, transfer_successful: true, origin_city: 'Atlanta', origin_state: 'GA', destination_city: 'Dallas', destination_state: 'TX' },
];

// ============================================================================
// Main App
// ============================================================================
export default function App() {
  const [apiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const { data, status, refresh, isLoading } = useDashboardData({ apiUrl });
  const { generate, isGenerating } = useGenerateDemoData(apiUrl);

  const handleGenerateDemo = useCallback(async () => {
    const success = await generate(10);
    if (success) setTimeout(refresh, 500);
  }, [generate, refresh]);

  const metrics = data?.metrics || DEMO_METRICS;
  const outcomeDistribution = data?.outcome_distribution || DEMO_DISTRIBUTION;
  const calls = data?.recent_calls || DEMO_CALLS;

  const totalCalls = Object.values(outcomeDistribution).reduce((a, b) => a + (b || 0), 0);
  const ineligibleCount = outcomeDistribution.carrier_ineligible || 0;
  const fmcsaPassRate = totalCalls > 0 ? (((totalCalls - ineligibleCount) / totalCalls) * 100).toFixed(0) : '—';

  const primaryKPIs = [
    {
      title: 'Total Calls', value: metrics.total_calls.toString(),
      trend: `+${metrics.total_calls}`, trendUp: metrics.total_calls > 0,
      subtitle: 'Carriers processed', description: 'Inbound call volume',
    },
    {
      title: 'Loads Booked', value: metrics.successful_bookings.toString(),
      trend: `+${metrics.successful_bookings}`, trendUp: metrics.successful_bookings > 0,
      subtitle: 'Successfully matched', description: 'Confirmed shipments',
    },
    {
      title: 'Conversion Rate', value: formatPercentage(metrics.conversion_rate),
      trend: metrics.conversion_rate > 15 ? `+${(metrics.conversion_rate - 15).toFixed(1)}% vs avg` : `${(metrics.conversion_rate - 15).toFixed(1)}% vs avg`,
      trendUp: metrics.conversion_rate > 15,
      subtitle: 'Calls to bookings', description: 'Industry avg: 15%',
    },
    {
      title: 'Revenue Booked', value: `$${(metrics.total_revenue_booked / 1000).toFixed(1)}k`,
      trend: metrics.total_revenue_booked > 0 ? 'Active' : 'Pending', trendUp: metrics.total_revenue_booked > 0,
      subtitle: 'Total confirmed value', description: 'From matched loads',
    },
  ];

  const secondaryStats = [
    { title: 'Avg Negotiation Rounds', value: metrics.avg_negotiation_rounds.toFixed(1), subtitle: 'Counter-offers per deal', icon: Repeat2 },
    { title: 'Avg Rate Discount', value: formatPercentage(metrics.avg_discount_from_loadboard), subtitle: 'Below loadboard rate', icon: Percent },
    { title: 'FMCSA Pass Rate', value: `${fmcsaPassRate}%`, subtitle: `${ineligibleCount} ineligible carriers`, icon: ShieldCheck },
    { title: 'Avg Call Duration', value: formatDuration(metrics.avg_call_duration_seconds), subtitle: `${metrics.transfers_to_rep} transferred to rep`, icon: Clock },
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
              {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting...' : 'Demo Mode'}
            </span>
            <button onClick={refresh} disabled={isLoading}
              className="inline-flex items-center gap-2 h-8 px-3 text-sm rounded-md border bg-background hover:bg-muted transition-colors disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={handleGenerateDemo} disabled={isGenerating}
              className="inline-flex items-center gap-2 h-8 px-3 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Plus className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Demo Calls'}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="p-6 max-w-[1600px] mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time carrier sales performance · HappyRobot Voice AI</p>
        </div>

        {/* Primary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryKPIs.map((card, i) => <KPICard key={i} {...card} />)}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryStats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Row: Outcomes + Sentiment */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <div className="lg:col-span-4"><OutcomesBarChart distribution={outcomeDistribution} /></div>
          <div className="lg:col-span-3"><SentimentPieChart positive={metrics.sentiment_positive} neutral={metrics.sentiment_neutral} negative={metrics.sentiment_negative} /></div>
        </div>

        {/* Row: Negotiation Funnel + Rate Walk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NegotiationFunnelChart calls={calls} />
          <RateWalkChart calls={calls} />
        </div>

        {/* Network Explorer */}
        <NetworkExplorer calls={calls} />

        {/* Call Volume */}
        <CallTrendsAreaChart calls={calls} />

        {/* Full Call Log Table */}
        <CallsTable calls={calls} />
      </main>
    </div>
  );
}
