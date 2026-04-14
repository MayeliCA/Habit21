import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { SuccessMetricCard } from '@/components/dashboard/SuccessMetricCard';
import type { AnalyticsResponse } from '@shared/types/analytics';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    api
      .get<AnalyticsResponse>('/analytics', { params: { date: today } })
      .then((res) => setAnalytics(res.data))
      .finally(() => setLoading(false));
  }, [today]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{es.dashboard.title}</h1>
        <p className="text-muted-foreground">{es.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{es.dashboard.title}</h1>

      {analytics?.successMetric && (
        <SuccessMetricCard metric={analytics.successMetric} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <CategoryChart data={analytics?.daily ?? []} title={es.dashboard.timeDistribution} />
        <CategoryChart data={analytics?.weekly ?? []} title={es.dashboard.weekSummary} />
        <CategoryChart data={analytics?.monthly ?? []} title={es.dashboard.monthSummary} />
      </div>
    </div>
  );
}
