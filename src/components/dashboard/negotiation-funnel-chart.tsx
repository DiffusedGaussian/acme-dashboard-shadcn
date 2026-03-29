import { Repeat2 } from 'lucide-react';
import {
  Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { CallRecord } from '../../types';

interface NegotiationFunnelChartProps {
  calls: CallRecord[];
  selectedCall?: CallRecord | null;
}

export function NegotiationFunnelChart({ calls, selectedCall }: NegotiationFunnelChartProps) {
  const selectedRound =
    selectedCall && selectedCall.negotiation_rounds > 0 ? selectedCall.negotiation_rounds : null;

  const negotiated = calls.filter(c => c.negotiation_rounds > 0);

  const data = [1, 2, 3].map(round => {
    const atRound = negotiated.filter(c => c.negotiation_rounds === round);
    const agreed = atRound.filter(
      c => c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer'
    ).length;
    return { round: `Round ${round}`, agreed, noDeal: atRound.length - agreed };
  });

  const totalNegotiated = negotiated.length;
  const closedViaNegs = negotiated.filter(
    c => c.outcome === 'load_booked' || c.outcome === 'price_agreed_transfer'
  ).length;
  const negsCloseRate =
    totalNegotiated > 0 ? ((closedViaNegs / totalNegotiated) * 100).toFixed(0) : '0';

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Negotiation Depth
              {selectedRound ? (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-primary border-primary/30 bg-primary/5">
                  ↳ Round {selectedRound}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-primary border-primary/30 bg-primary/5">
                  <Repeat2 className="h-3 w-3" /> {negsCloseRate}% close rate
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {selectedRound
                ? `This call reached round ${selectedRound}`
                : 'Deals agreed vs. no-deal by counter-offer round'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#00C853' }} />
              <span className="text-muted-foreground">Agreed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#F05A28' }} />
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
              <XAxis
                dataKey="round"
                tickLine={false} axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                tickLine={false} axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [value, name === 'agreed' ? 'Deal Agreed' : 'No Deal']}
              />
              <Bar dataKey="agreed" radius={[4, 4, 0, 0]}>
                {data.map(entry => {
                  const rNum = parseInt(entry.round.split(' ')[1]);
                  return (
                    <Cell
                      key={entry.round}
                      fill="#00C853"
                      fillOpacity={selectedRound && rNum !== selectedRound ? 0.2 : 1}
                      stroke={rNum === selectedRound ? '#009c3c' : 'none'}
                      strokeWidth={2}
                    />
                  );
                })}
              </Bar>
              <Bar dataKey="noDeal" radius={[4, 4, 0, 0]}>
                {data.map(entry => {
                  const rNum = parseInt(entry.round.split(' ')[1]);
                  return (
                    <Cell
                      key={entry.round}
                      fill="#F05A28"
                      fillOpacity={selectedRound && rNum !== selectedRound ? 0.2 : 1}
                      stroke={rNum === selectedRound ? '#ea6906' : 'none'}
                      strokeWidth={2}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
