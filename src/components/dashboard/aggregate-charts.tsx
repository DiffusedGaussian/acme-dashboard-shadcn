import type { DashboardMetrics, OutcomeDistribution, CallRecord } from '../../types';
import { CallLifecycleFunnel } from './call-lifecycle-funnel';
import { OutcomesBarChart } from './outcomes-bar-chart';
import { SentimentPieChart } from './sentiment-pie-chart';
import { NegotiationFunnelChart } from './negotiation-funnel-chart';
import { RateWalkChart } from './rate-walk-chart';
import { CallTrendsAreaChart } from './call-trends-area-chart';
import { NetworkExplorer } from './network-explorer';

interface AggregateChartsProps {
  metrics: DashboardMetrics;
  distribution: OutcomeDistribution;
  calls: CallRecord[];
}

export function AggregateCharts({ metrics, distribution, calls }: AggregateChartsProps) {
  return (
    <div className="p-3 space-y-3">

      {/* Hint */}
      <p className="text-xs text-muted-foreground px-1">
        Select a call from the list to explore its details ↙
      </p>

      {/* Call lifecycle — the story of all calls */}
      <CallLifecycleFunnel distribution={distribution} />

      {/* Where calls went + sentiment */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-3">
        <div className="xl:col-span-4">
          <OutcomesBarChart distribution={distribution} />
        </div>
        <div className="xl:col-span-3">
          <SentimentPieChart
            positive={metrics.sentiment_positive}
            neutral={metrics.sentiment_neutral}
            negative={metrics.sentiment_negative}
          />
        </div>
      </div>

      {/* Negotiation depth + rate walk */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <NegotiationFunnelChart calls={calls} />
        <RateWalkChart calls={calls} />
      </div>

      {/* Call volume by hour */}
      <CallTrendsAreaChart calls={calls} />

      {/* Lane network */}
      <NetworkExplorer calls={calls} selectedCall={null} />
    </div>
  );
}
