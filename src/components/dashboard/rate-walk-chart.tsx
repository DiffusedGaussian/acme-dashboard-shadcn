import { Percent } from 'lucide-react';
import {
  Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { CallRecord } from '../../types';
import { formatCurrency } from '../../utils';

interface RateWalkChartProps {
  calls: CallRecord[];
  selectedCall?: CallRecord | null;
}

export function RateWalkChart({ calls, selectedCall }: RateWalkChartProps) {
  const booked = calls
    .filter(
      c =>
        (c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer') &&
        c.loadboard_rate &&
        c.final_rate
    )
    .slice(-10);

  const selectedName = selectedCall?.carrier_name?.split(' ')[0] || null;
  const selectedIsBooked =
    selectedCall &&
    (selectedCall.outcome === 'load_booked' || selectedCall.outcome === 'price_agreed_transfer') &&
    selectedCall.loadboard_rate &&
    selectedCall.final_rate;
  const inList = selectedIsBooked && booked.some(c => c.id === selectedCall?.id);
  const displayBooked =
    selectedIsBooked && !inList ? [selectedCall!, ...booked.slice(0, 9)] : booked;

  const data = displayBooked.map((c, i) => ({
    name: c.carrier_name?.split(' ')[0] || `#${i + 1}`,
    offered: c.loadboard_rate,
    agreed: c.final_rate,
    isSelected: c.id === selectedCall?.id,
  }));

  const avgSavings =
    booked.length > 0
      ? (booked.reduce((sum, c) => sum + (c.discount_percentage || 0), 0) / booked.length).toFixed(1)
      : '0';

  const fallback = [
    { name: 'Swift',   offered: 2800, agreed: 2650, isSelected: false },
    { name: 'Midwest', offered: 3200, agreed: 2950, isSelected: false },
    { name: 'Pacific', offered: 2400, agreed: 2350, isSelected: false },
    { name: 'Eastern', offered: 1850, agreed: 1850, isSelected: false },
    { name: 'Summit',  offered: 3100, agreed: 2900, isSelected: false },
  ];
  const displayData = data.length > 0 ? data : fallback;
  const hasSelection = selectedCall !== null && selectedCall !== undefined;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Rate Walk
              {selectedIsBooked ? (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-primary border-primary/30 bg-primary/5">
                  ↳ {selectedName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-primary border-primary/30 bg-primary/5">
                  <Percent className="h-3 w-3" /> avg {avgSavings}% off
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {selectedIsBooked
                ? `${formatCurrency(selectedCall!.loadboard_rate)} offered → ${formatCurrency(selectedCall!.final_rate)} agreed`
                : 'Offered vs. agreed rate per booked load'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#94a3b8]" />
              <span className="text-muted-foreground">Offered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#00C853]" />
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
              <XAxis
                dataKey="name"
                tickLine={false} axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis
                tickLine={false} axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={value => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Bar dataKey="offered" radius={[4, 4, 0, 0]}>
                {displayData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill="#94a3b8"
                    fillOpacity={hasSelection && !entry.isSelected ? 0.2 : 1}
                    stroke={entry.isSelected ? '#64748b' : 'none'}
                    strokeWidth={2}
                  />
                ))}
              </Bar>
              <Bar dataKey="agreed" radius={[4, 4, 0, 0]}>
                {displayData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill='#00C853'
                    fillOpacity={hasSelection && !entry.isSelected ? 0.2 : 1}
                    stroke={entry.isSelected ? '#16a34a' : 'none'}
                    strokeWidth={2}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
