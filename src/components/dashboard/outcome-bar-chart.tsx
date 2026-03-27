import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Badge } from '../ui/badge';
import { Icons } from '../icons';
import type { OutcomeDistribution } from '../../types';

interface OutcomeBarChartProps {
  distribution: OutcomeDistribution;
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

const colorMap: Record<string, string> = {
  load_booked: 'hsl(142, 76%, 36%)',
  price_agreed_transfer: 'hsl(142, 76%, 46%)',
  no_agreement: 'hsl(43, 74%, 49%)',
  carrier_not_interested: 'hsl(240, 5%, 64%)',
  carrier_ineligible: 'hsl(0, 84%, 60%)',
  no_matching_loads: 'hsl(240, 5%, 50%)',
  call_dropped: 'hsl(0, 72%, 51%)',
  carrier_hung_up: 'hsl(32, 95%, 44%)',
  max_negotiations_reached: 'hsl(48, 96%, 53%)',
};

export function OutcomeBarChart({ distribution }: OutcomeBarChartProps) {
  const chartData = Object.entries(distribution)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      outcome: labelMap[key] || key,
      count: value,
      fill: colorMap[key] || 'hsl(var(--chart-1))',
    }));

  const totalCalls = chartData.reduce((sum, item) => sum + item.count, 0);
  const bookedCalls = distribution.load_booked || 0;
  const conversionRate = totalCalls > 0 ? ((bookedCalls / totalCalls) * 100).toFixed(1) : '0';

  const chartConfig = {
    count: {
      label: 'Calls',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Call Outcome Distribution
          <Badge variant='outline'>
            {Number(conversionRate) > 15 ? (
              <Icons.trendingUp className='size-3' />
            ) : (
              <Icons.trendingDown className='size-3' />
            )}
            {conversionRate}% converted
          </Badge>
        </CardTitle>
        <CardDescription>Breakdown by result classification</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <BarChart
            data={chartData}
            layout='vertical'
            margin={{ left: 0, right: 16 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray='3 3' />
            <YAxis
              dataKey='outcome'
              type='category'
              tickLine={false}
              axisLine={false}
              width={90}
              tick={{ fontSize: 12 }}
            />
            <XAxis type='number' hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey='count'
              radius={[0, 4, 4, 0]}
              fill='var(--color-count)'
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
