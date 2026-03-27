import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Icons } from '../icons';
import type { DashboardMetrics } from '../../types';
import { formatCurrency, formatDuration, formatPercentage } from '../../utils';

interface KPICardsProps {
  metrics: DashboardMetrics;
}

export function KPICards({ metrics }: KPICardsProps) {
  const cards = [
    {
      title: 'Total Calls',
      value: metrics.total_calls.toString(),
      description: "Today's inbound volume",
      trend: metrics.total_calls > 0 ? '+' + metrics.total_calls : '0',
      trendUp: metrics.total_calls > 0,
      footer: 'Carrier inquiries processed',
    },
    {
      title: 'Loads Booked',
      value: metrics.successful_bookings.toString(),
      description: 'Successfully matched',
      trend: metrics.successful_bookings > 0 ? '+' + metrics.successful_bookings : '0',
      trendUp: metrics.successful_bookings > 0,
      footer: 'Confirmed shipments today',
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(metrics.conversion_rate),
      description: 'Calls to bookings',
      trend: metrics.conversion_rate > 15 ? '+' + formatPercentage(metrics.conversion_rate - 15) : formatPercentage(metrics.conversion_rate - 15),
      trendUp: metrics.conversion_rate > 15,
      footer: 'Industry avg: 15%',
    },
    {
      title: 'Revenue Booked',
      value: formatCurrency(metrics.total_revenue_booked),
      description: 'Total confirmed value',
      trend: metrics.total_revenue_booked > 0 ? 'Active' : 'Pending',
      trendUp: metrics.total_revenue_booked > 0,
      footer: 'From matched loads',
    },
    {
      title: 'Avg Call Duration',
      value: formatDuration(Math.round(metrics.avg_call_duration_seconds)),
      description: 'Per carrier interaction',
      trend: metrics.avg_call_duration_seconds < 180 ? 'Efficient' : 'Extended',
      trendUp: metrics.avg_call_duration_seconds < 180,
      footer: 'Target: < 3 min',
    },
    {
      title: 'Negotiation Rounds',
      value: metrics.avg_negotiation_rounds.toFixed(1),
      description: 'Average per call',
      trend: metrics.avg_negotiation_rounds <= 2 ? 'Optimal' : 'High',
      trendUp: metrics.avg_negotiation_rounds <= 2,
      footer: 'Max allowed: 3',
    },
    {
      title: 'Transfers to Rep',
      value: metrics.transfers_to_rep.toString(),
      description: 'Price agreed → handoff',
      trend: metrics.transfers_to_rep > 0 ? '+' + metrics.transfers_to_rep : '0',
      trendUp: metrics.transfers_to_rep > 0,
      footer: 'Ready for confirmation',
    },
    {
      title: 'Avg Discount',
      value: formatPercentage(metrics.avg_discount_from_loadboard),
      description: 'From loadboard rate',
      trend: metrics.avg_discount_from_loadboard < 10 ? 'Good' : 'High',
      trendUp: metrics.avg_discount_from_loadboard < 10,
      footer: 'Target: < 10%',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card, index) => (
        <Card key={index} className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-sm'>
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                {card.trendUp ? (
                  <Icons.trendingUp className='size-3' />
                ) : (
                  <Icons.trendingDown className='size-3' />
                )}
                {card.trend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              {card.description}
              {card.trendUp ? (
                <Icons.trendingUp className='size-4 text-emerald-500' />
              ) : (
                <Icons.trendingDown className='size-4 text-amber-500' />
              )}
            </div>
            <div className='text-muted-foreground'>
              {card.footer}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
