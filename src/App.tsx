import { useState, useCallback } from 'react';
import { useDashboardData } from './hooks';
import {
  Header,
  CallListPanel,
  CallDetailView,
  AggregateCharts,
} from './components/dashboard';
import type { CallRecord } from './types';
import { DEMO_METRICS, DEMO_DISTRIBUTION, DEMO_CALLS } from './data/demo';
import './styles/globals.css';

export default function App() {
  const [apiUrl] = useState(import.meta.env.VITE_API_URL ?? '');
  const { data, status, refresh, isLoading } = useDashboardData({ apiUrl });
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  const handleSelectCall = useCallback((call: CallRecord | null) => {
    setSelectedCallId(call?.id ?? null);
  }, []);

  const metrics      = data?.metrics              || DEMO_METRICS;
  const distribution = data?.outcome_distribution || DEMO_DISTRIBUTION;
  const calls        = data?.recent_calls         || DEMO_CALLS;
  const selectedCall = selectedCallId
    ? calls.find(c => c.id === selectedCallId) ?? null
    : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">

      {/* ── Header with inline KPIs ── */}
      <Header
        status={status}
        isLoading={isLoading}
        onRefresh={refresh}
        metrics={metrics}
        distribution={distribution}
      />

      {/* ── Master / Detail ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left — call list */}
        <div className="w-[320px] flex-shrink-0 border-r border-border flex flex-col overflow-hidden bg-card">
          <CallListPanel
            calls={calls}
            selectedCallId={selectedCallId}
            onSelect={handleSelectCall}
          />
        </div>

        {/* Right — detail or aggregate */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-background">
          {selectedCall ? (
            <CallDetailView call={selectedCall} allCalls={calls} />
          ) : (
            <AggregateCharts
              metrics={metrics}
              distribution={distribution}
              calls={calls}
            />
          )}
        </div>

      </div>
    </div>
  );
}
