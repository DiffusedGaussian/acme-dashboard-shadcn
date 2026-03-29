import { TrendingUp, TrendingDown } from 'lucide-react';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CallRecord } from '../../types';
import { getSentimentConfig } from '../../utils';


const SENTIMENT_GROUP: Record<string, string> = {
  very_positive: 'Positive',
  positive: 'Positive',
  eager: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
  very_negative: 'Negative',
  frustrated: 'Negative',
};

interface SentimentPieChartProps {
  positive: number;
  neutral: number;
  negative: number;
  selectedCall?: CallRecord | null;
}

export function SentimentPieChart({ positive, neutral, negative, selectedCall }: SentimentPieChartProps) {
  const selectedGroup = selectedCall ? SENTIMENT_GROUP[selectedCall.sentiment] : null;
  const sentimentLabel = selectedCall ? getSentimentConfig(selectedCall.sentiment).label : null;
  const total = positive + neutral + negative;
  const positiveRate = total > 0 ? ((positive / total) * 100).toFixed(0) : '0';

  const chartData = [
    { name: 'Positive', value: positive, fill: '#00C853' },
    { name: 'Neutral',  value: neutral,  fill: '#94A3B8' },
    { name: 'Negative', value: negative, fill: '#F05A28' },
  ].filter(d => d.value > 0);

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full transition-all duration-200 hover:shadow-md">
      <div className="p-6 pb-2 text-center">
        <h3 className="font-semibold flex items-center justify-center gap-2">
          Carrier Sentiment
          {selectedCall ? (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border text-primary border-primary/30 bg-primary/5">
              {sentimentLabel}
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border ${
              Number(positiveRate) >= 50
                ? 'text-primary border-primary/30 bg-primary/5'
                : 'text-orange-600 border-orange-200/60 bg-orange-50'
            }`}>
              {Number(positiveRate) >= 50
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              {positiveRate}% positive
            </span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          {selectedCall
            ? `This call: ${getSentimentConfig(selectedCall.sentiment).label}`
            : 'AI-classified mood per call'}
        </p>
      </div>
      <div className="p-6 pt-0 flex flex-col items-center">
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%" cy="50%"
                innerRadius={40} outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                cornerRadius={4}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    fillOpacity={selectedGroup && entry.name !== selectedGroup ? 0.15 : 1}
                    stroke={entry.name === selectedGroup ? entry.fill : 'none'}
                    strokeWidth={entry.name === selectedGroup ? 3 : 0}
                  />
                ))}
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
        <div className="flex justify-center gap-5 mt-2">
          {chartData.map(item => (
            <div
              key={item.name}
              className={`flex items-center gap-1.5 text-xs transition-opacity ${
                selectedGroup && item.name !== selectedGroup ? 'opacity-30' : ''
              }`}
            >
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-muted-foreground">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
