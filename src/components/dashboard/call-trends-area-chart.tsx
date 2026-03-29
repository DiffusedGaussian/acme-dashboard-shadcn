import { TrendingUp } from 'lucide-react';
import {
  Area, AreaChart, XAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { CallRecord } from '../../types';

interface CallTrendsAreaChartProps {
  calls: CallRecord[];
}

export function CallTrendsAreaChart({ calls }: CallTrendsAreaChartProps) {
  const callsByHour = calls.reduce(
    (acc, call) => {
      const hour = new Date(call.timestamp).getHours();
      const label = `${hour.toString().padStart(2, '0')}:00`;
      if (!acc[label]) acc[label] = { hour: label, total: 0, booked: 0 };
      acc[label].total += 1;
      if (call.outcome === 'load_booked' || call.outcome === 'price_agreed_transfer') {
        acc[label].booked += 1;
      }
      return acc;
    },
    {} as Record<string, { hour: string; total: number; booked: number }>
  );

  const chartData = Object.values(callsByHour).sort((a, b) => a.hour.localeCompare(b.hour));
  const displayData =
    chartData.length > 0
      ? chartData
      : [
          { hour: '09:00', total: 8,  booked: 3 },
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
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-primary border-primary/30 bg-primary/5">
                <TrendingUp className="h-3 w-3" />
                Live
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">Hourly inbound call distribution</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#94A3B8]" />
              <span className="text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#00C853]" />
              <span className="text-muted-foreground">Booked</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00C853" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00C853" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="hour"
                tickLine={false} axisLine={false}
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
              <Area type="monotone" dataKey="total"  stroke="#94A3B8" fill="url(#colorTotal)"  strokeWidth={2} />
              <Area type="monotone" dataKey="booked" stroke="#00C853" fill="url(#colorBooked)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
