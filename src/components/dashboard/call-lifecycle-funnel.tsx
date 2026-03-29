import { Phone, ShieldCheck, Package, MessageSquare, CheckCircle2, ChevronRight } from 'lucide-react';
import type { OutcomeDistribution } from '../../types';

interface CallLifecycleFunnelProps {
  distribution: OutcomeDistribution;
}

export function CallLifecycleFunnel({ distribution }: CallLifecycleFunnelProps) {
  const totalCalls = Object.values(distribution).reduce((a, b) => a + (b || 0), 0);
  const ineligible = distribution.carrier_ineligible || 0;
  const noLoads = distribution.no_matching_loads || 0;
  const disengaged =
    (distribution.carrier_not_interested || 0) +
    (distribution.carrier_hung_up || 0) +
    (distribution.call_dropped || 0);
  const booked = (distribution.load_booked || 0) + (distribution.price_agreed_transfer || 0);

  const fmcsaPassed = totalCalls - ineligible;
  const loadMatched = fmcsaPassed - noLoads;
  const negotiated = loadMatched - disengaged;
  const conversionPct = totalCalls > 0 ? ((booked / totalCalls) * 100).toFixed(1) : '0';

  const stages = [
    {
      label: 'Called In',
      count: totalCalls,
      Icon: Phone,
      color: 'text-muted-foreground',
      bg: 'bg-muted/40',
      border: 'border-border',
    },
    {
      label: 'FMCSA Verified',
      count: fmcsaPassed,
      Icon: ShieldCheck,
      color: 'text-muted-foreground',
      bg: 'bg-muted/40',
      border: 'border-border',
    },
    {
      label: 'Load Matched',
      count: loadMatched,
      Icon: Package,
      color: 'text-muted-foreground',
      bg: 'bg-muted/40',
      border: 'border-border',
    },
    {
      label: 'Negotiated',
      count: Math.max(negotiated, 0),
      Icon: MessageSquare,
      color: 'text-muted-foreground',
      bg: 'bg-muted/40',
      border: 'border-border',
    },
    {
      label: 'Booked',
      count: booked,
      Icon: CheckCircle2,
      color: 'text-primary',
      bg: 'bg-primary/5',
      border: 'border-primary/30',
    },
  ];

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Call Lifecycle</h2>
          <p className="text-sm text-muted-foreground mt-0.5">From first ring to booked load</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{booked}</div>
          <div className="text-xs text-muted-foreground">loads booked</div>
        </div>
      </div>

      {/* Funnel stages */}
      <div className="flex items-stretch gap-0">
        {stages.map((stage, i) => {
          const prev = i > 0 ? stages[i - 1].count : null;
          const passPct = prev && prev > 0 ? Math.round((stage.count / prev) * 100) : null;
          const isLast = i === stages.length - 1;
          const { Icon } = stage;

          return (
            <div key={stage.label} className="flex items-center flex-1 min-w-0">
              <div
                className={`flex-1 min-w-0 rounded-xl border p-3 sm:p-4 text-center transition-all h-full ${stage.bg} ${stage.border}`}
              >
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1.5 ${stage.color}`} />
                <div className={`text-xl sm:text-2xl font-bold tabular-nums ${isLast ? 'text-primary' : 'text-foreground'}`}>
                  {stage.count}
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-0.5 leading-tight">
                  {stage.label}
                </div>
                {passPct !== null && (
                  <div className="text-[10px] mt-1.5 px-1.5 py-0.5 rounded-full inline-block font-medium bg-muted text-muted-foreground">
                    {passPct}%
                  </div>
                )}
              </div>
              {!isLast && (
                <ChevronRight className="flex-shrink-0 h-4 w-4 mx-0.5 text-muted-foreground/30" />
              )}
            </div>
          );
        })}
      </div>

      {/* End-to-end progress bar */}
      <div className="mt-5">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${conversionPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>0%</span>
          <span className="font-medium text-primary">{conversionPct}% end-to-end conversion</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
