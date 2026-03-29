import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { OutcomeDistribution, CallRecord } from '../../types';

const OUTCOME_GROUP: Record<string, string> = {
  load_booked: 'Booked',
  price_agreed_transfer: 'Booked',
  no_agreement: 'No Deal',
  carrier_not_interested: 'No Deal',
  carrier_ineligible: 'Failed',
  call_dropped: 'Failed',
  no_matching_loads: 'Other',
  carrier_hung_up: 'Other',
  max_negotiations_reached: 'Other',
};

interface OutcomesBarChartProps {
  distribution: OutcomeDistribution;
  selectedCall?: CallRecord | null;
}

export function OutcomesBarChart({ distribution, selectedCall }: OutcomesBarChartProps) {
  const selectedGroup = selectedCall ? OUTCOME_GROUP[selectedCall.outcome] : null;

  const chartData = [
    { name: 'Booked',   success: distribution.load_booked || 0,          other: distribution.price_agreed_transfer || 0 },
    { name: 'No Deal',  success: distribution.no_agreement || 0,          other: distribution.carrier_not_interested || 0 },
    { name: 'Failed',   success: distribution.carrier_ineligible || 0,    other: distribution.call_dropped || 0 },
    { name: 'Other',    success: distribution.no_matching_loads || 0,     other: distribution.carrier_hung_up || 0 },
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
              {selectedCall ? (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-primary border-primary/30 bg-primary/5">
                  ↳ {selectedGroup}
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border ${
                  Number(conversionRate) > 20
                    ? 'text-primary border-primary/30 bg-primary/5'
                    : 'text-orange-600 border-orange-200/60 bg-orange-50'
                }`}>
                  {Number(conversionRate) > 20
                    ? <TrendingUp className="h-3 w-3" />
                    : <TrendingDown className="h-3 w-3" />}
                  {conversionRate}% conversion
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {selectedCall ? `This call: ${selectedGroup}` : 'Breakdown by result type'}
            </p>
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
              <Bar dataKey="success" radius={[4, 4, 0, 0]}>
                {chartData.map(entry => (
                  <Cell
                    key={entry.name}
                    fill="#00C853"
                    fillOpacity={selectedGroup && entry.name !== selectedGroup ? 0.2 : 1}
                    stroke={entry.name === selectedGroup ? '#009c3c' : 'none'}
                    strokeWidth={2}
                  />
                ))}
              </Bar>
              <Bar dataKey="other" radius={[4, 4, 0, 0]}>
                {chartData.map(entry => (
                  <Cell
                    key={entry.name}
                    fill="#94A3B8"
                    fillOpacity={selectedGroup && entry.name !== selectedGroup ? 0.2 : 1}
                    stroke={entry.name === selectedGroup ? '#64748b' : 'none'}
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
