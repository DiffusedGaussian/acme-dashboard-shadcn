import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Badge } from '../ui/badge';
import { Icons } from '../icons';
import type { CallRecord } from '../../types';

interface CallTrendsChartProps {
  calls: CallRecord[];
}

export function CallTrendsChart({ calls }: CallTrendsChartProps) {
  // Group calls by hour for the trend chart
  const callsByHour = calls.reduce((acc, call) => {
    const hour = new Date(call.timestamp).getHours();
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
    
    if (!acc[hourLabel]) {
      acc[hourLabel] = { hour: hourLabel, total: 0, booked: 0 };
    }
    acc[hourLabel].total += 1;
    if (call.outcome === 'load_booked' || call.outcome === 'price_agreed_transfer') {
      acc[hourLabel].booked += 1;
    }
    return acc;
  }, {} as Record<string, { hour: string; total: number; booked: number }>);

  const chartData = Object.values(callsByHour).sort((a, b) => 
    a.hour.localeCompare(b.hour)
  );

  // If no data, show sample data
  const displayData = chartData.length > 0 ? chartData : [
    { hour: '09:00', total: 12, booked: 4 },
    { hour: '10:00', total: 18, booked: 6 },
    { hour: '11:00', total: 15, booked: 5 },
    { hour: '12:00', total: 8, booked: 3 },
    { hour: '13:00', total: 20, booked: 8 },
    { hour: '14:00', total: 25, booked: 10 },
    { hour: '15:00', total: 22, booked: 9 },
    { hour: '16:00', total: 16, booked: 5 },
  ];

  const totalCalls = displayData.reduce((sum, d) => sum + d.total, 0);
  const totalBooked = displayData.reduce((sum, d) => sum + d.booked, 0);
  const conversionRate = totalCalls > 0 ? ((totalBooked / totalCalls) * 100).toFixed(1) : '0';

  const chartConfig = {
    total: {
      label: 'Total Calls',
      color: 'hsl(var(--chart-2))',
    },
    booked: {
      label: 'Booked',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Call Volume Trends
          <Badge variant='outline'>
            <Icons.trendingUp className='size-3' />
            {conversionRate}% conversion
          </Badge>
        </CardTitle>
        <CardDescription>
          Hourly call distribution and booking rate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <AreaChart data={displayData} margin={{ left: 0, right: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis
              dataKey='hour'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={30}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <defs>
              <linearGradient id='fillTotal' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-total)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-total)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillBooked' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-booked)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-booked)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey='total'
              type='monotone'
              fill='url(#fillTotal)'
              fillOpacity={0.4}
              stroke='var(--color-total)'
              strokeWidth={2}
            />
            <Area
              dataKey='booked'
              type='monotone'
              fill='url(#fillBooked)'
              fillOpacity={0.4}
              stroke='var(--color-booked)'
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
