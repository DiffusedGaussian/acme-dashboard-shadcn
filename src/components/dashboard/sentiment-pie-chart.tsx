import { Pie, PieChart, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Badge } from '../ui/badge';
import { Icons } from '../icons';

interface SentimentPieChartProps {
  positive: number;
  neutral: number;
  negative: number;
}

export function SentimentPieChart({ positive, neutral, negative }: SentimentPieChartProps) {
  const total = positive + neutral + negative;
  
  const chartData = [
    { sentiment: 'Positive', count: positive, fill: 'hsl(142, 76%, 36%)' },
    { sentiment: 'Neutral', count: neutral, fill: 'hsl(240, 5%, 64%)' },
    { sentiment: 'Negative', count: negative, fill: 'hsl(0, 84%, 60%)' },
  ].filter(item => item.count > 0);

  const positiveRate = total > 0 ? ((positive / total) * 100).toFixed(0) : '0';

  const chartConfig = {
    count: {
      label: 'Calls',
    },
    positive: {
      label: 'Positive',
      color: 'hsl(142, 76%, 36%)',
    },
    neutral: {
      label: 'Neutral',
      color: 'hsl(240, 5%, 64%)',
    },
    negative: {
      label: 'Negative',
      color: 'hsl(0, 84%, 60%)',
    },
  } satisfies ChartConfig;

  if (total === 0) {
    return (
      <Card className='flex h-full flex-col'>
        <CardHeader className='items-center pb-0'>
          <CardTitle>
            Carrier Sentiment
            <Badge variant='outline'>
              <Icons.alertCircle className='size-3' />
              No data
            </Badge>
          </CardTitle>
          <CardDescription>AI-classified emotional state</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-1 items-center justify-center'>
          <div className='text-muted-foreground text-sm'>
            No sentiment data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>
          Carrier Sentiment
          <Badge variant='outline'>
            {Number(positiveRate) >= 50 ? (
              <Icons.trendingUp className='size-3' />
            ) : (
              <Icons.trendingDown className='size-3' />
            )}
            {positiveRate}% positive
          </Badge>
        </CardTitle>
        <CardDescription>AI-classified emotional state</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px] min-h-[200px] [&_.recharts-text]:fill-background'
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey='sentiment' hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='count'
              nameKey='sentiment'
              innerRadius={40}
              outerRadius={80}
              paddingAngle={3}
              cornerRadius={4}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey='count'
                stroke='none'
                fontSize={12}
                fontWeight={600}
                fill='white'
                formatter={(value: number) => value.toString()}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className='flex justify-center gap-6 pb-4'>
        {chartData.map((item) => (
          <div key={item.sentiment} className='flex items-center gap-2 text-sm'>
            <div
              className='h-3 w-3 rounded-full'
              style={{ backgroundColor: item.fill }}
            />
            <span className='text-muted-foreground'>{item.sentiment}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
