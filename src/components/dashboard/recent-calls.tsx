import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import type { CallRecord } from '../../types';
import { formatDuration, formatTimestamp, formatCurrency, getOutcomeConfig, getSentimentConfig } from '../../utils';

interface RecentCallsProps {
  calls: CallRecord[];
}

export function RecentCalls({ calls }: RecentCallsProps) {
  const recentCalls = calls.slice(0, 5);

  if (recentCalls.length === 0) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>Latest carrier interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <div className='text-4xl mb-2'>📞</div>
            <p className='text-muted-foreground text-sm'>
              No calls recorded yet
            </p>
            <p className='text-muted-foreground text-xs mt-1'>
              Inbound carrier calls will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
        <CardDescription>You processed {calls.length} calls today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {recentCalls.map((call) => {
            const outcomeConfig = getOutcomeConfig(call.outcome);
            const sentimentConfig = getSentimentConfig(call.sentiment);
            const initials = call.carrier_name
              ? call.carrier_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'CA';

            return (
              <div key={call.id} className='flex items-center gap-4'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback className='bg-primary/10 text-primary'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium leading-none truncate'>
                      {call.carrier_name || 'Unknown Carrier'}
                    </p>
                    <Badge 
                      variant={
                        outcomeConfig.className.includes('success') ? 'success' :
                        outcomeConfig.className.includes('danger') ? 'destructive' :
                        outcomeConfig.className.includes('warning') ? 'warning' :
                        'secondary'
                      }
                      className='text-[10px] px-1.5 py-0'
                    >
                      {outcomeConfig.label}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2 mt-1'>
                    <p className='text-xs text-muted-foreground'>
                      MC# {call.carrier_mc || '—'}
                    </p>
                    <span className='text-muted-foreground'>•</span>
                    <p className='text-xs text-muted-foreground'>
                      {formatDuration(call.duration_seconds)}
                    </p>
                    <span className='text-muted-foreground'>•</span>
                    <p className='text-xs text-muted-foreground'>
                      {sentimentConfig.emoji}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium'>
                    {formatCurrency(call.final_rate)}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatTimestamp(call.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
