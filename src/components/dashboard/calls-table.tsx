import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import type { CallRecord } from '../../types';
import { formatDuration, formatTimestamp, formatCurrency, getOutcomeConfig, getSentimentConfig } from '../../utils';

interface CallsTableProps {
  calls: CallRecord[];
}

export function CallsTable({ calls }: CallsTableProps) {
  if (calls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>All inbound carrier calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='text-5xl mb-4'>📞</div>
            <h3 className='text-lg font-semibold mb-2'>No calls recorded yet</h3>
            <p className='text-muted-foreground text-sm max-w-sm'>
              Inbound carrier calls will appear here in real-time as they are processed by the AI agent.
            </p>
            <code className='mt-4 text-xs bg-muted px-2 py-1 rounded'>
              POST /api/v1/demo/generate-calls
            </code>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call History</CardTitle>
        <CardDescription>{calls.length} calls recorded</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>MC Number</TableHead>
              <TableHead>Load ID</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className='text-right'>Final Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call) => {
              const outcomeConfig = getOutcomeConfig(call.outcome);
              const sentimentConfig = getSentimentConfig(call.sentiment);

              return (
                <TableRow key={call.id}>
                  <TableCell className='text-muted-foreground'>
                    {formatTimestamp(call.timestamp)}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {call.carrier_name || '—'}
                  </TableCell>
                  <TableCell>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>
                      {call.carrier_mc || '—'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>
                      {call.load_id || '—'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        outcomeConfig.className.includes('success') ? 'success' :
                        outcomeConfig.className.includes('danger') ? 'destructive' :
                        outcomeConfig.className.includes('warning') ? 'warning' :
                        'secondary'
                      }
                    >
                      {outcomeConfig.icon} {outcomeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                      {sentimentConfig.emoji} {sentimentConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDuration(call.duration_seconds)}</TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCurrency(call.final_rate)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
