import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import { formatTime } from '@/lib/format';
import { SuccessMetricCard } from '@/components/dashboard/SuccessMetricCard';
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection';
import { BalancePieChart } from '@/components/dashboard/BalancePieChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { TimelineBarChart } from '@/components/dashboard/TimelineBarChart';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import type { AnalyticsResponse, CategoryBreakdown } from '@shared/types/analytics';

function getBalanceInsight(data: CategoryBreakdown[]): string {
  const withData = data.filter((d) => d.plannedMinutes > 0);
  if (withData.length === 0) return es.dashboard.noData;
  const top = withData.reduce((a, b) => (a.plannedMinutes > b.plannedMinutes ? a : b));
  const total = withData.reduce((s, d) => s + d.plannedMinutes, 0);
  const pct = ((top.plannedMinutes / total) * 100).toFixed(0);
  const name = es.category[top.category].split('(')[0].trim();
  return es.dashboard.insightBalanceTop
    .replace('{top}', name)
    .replace('{pct}', pct)
    + ` (${formatTime(top.plannedMinutes)})`;
}

function getDisciplineInsight(data: CategoryBreakdown[]): string {
  const withData = data.filter((d) => d.plannedMinutes > 0);
  if (withData.length === 0) return es.dashboard.noData;
  let best = withData[0];
  let bestRate = 0;
  for (const d of withData) {
    const rate = (d.completedMinutes / d.plannedMinutes) * 100;
    if (rate > bestRate) {
      bestRate = rate;
      best = d;
    }
  }
  const name = es.category[best.category].split('(')[0].trim();
  return es.dashboard.insightDiscipline
    .replace('{pct}', bestRate.toFixed(0))
    .replace('{topCategory}', name);
}

function getWeeklyInsight(data: { planned: number; completed: number }[]): string {
  const withPlanned = data.filter((d) => d.planned > 0);
  if (withPlanned.length === 0) return es.dashboard.noData;
  const passed = withPlanned.filter((d) => (d.completed / d.planned) >= 0.8).length;
  return es.dashboard.insightWeekly
    .replace('{passed}', String(passed))
    .replace('{total}', String(withPlanned.length));
}

function getMonthlyInsight(data: { planned: number; completed: number }[]): string {
  const withPlanned = data.filter((d) => d.planned > 0);
  if (withPlanned.length === 0) return es.dashboard.noData;
  const passed = withPlanned.filter((d) => (d.completed / d.planned) >= 0.8).length;
  return es.dashboard.insightMonthly
    .replace('{passed}', String(passed))
    .replace('{total}', String(withPlanned.length));
}

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

  const d = analytics?.daily ?? [];
  const w = analytics?.weekly ?? [];
  const m = analytics?.monthly ?? [];
  const weeklyByDay = (analytics?.weeklyByDay ?? []).map((d) => ({
    label: d.dayLabel,
    planned: d.planned,
    completed: d.completed,
  }));
  const monthlyByWeek = (analytics?.monthlyByWeek ?? []).map((w) => ({
    label: w.weekLabel,
    planned: w.planned,
    completed: w.completed,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{es.dashboard.title}</h1>

      {analytics?.successMetric && (
        <SuccessMetricCard metric={analytics.successMetric} />
      )}

      {analytics && <ExecutiveSummary analytics={analytics} />}

      <CollapsibleSection
        title={es.dashboard.sectionDiscipline}
        subtitle={es.dashboard.disciplineGoal}
        defaultOpen={true}
      >
        <div className="space-y-6">
          <CategoryChart data={d} title={es.dashboard.daily} insight={getDisciplineInsight(d)} />
          <TimelineBarChart
            data={weeklyByDay}
            title={es.dashboard.weekly}
            insight={getWeeklyInsight(weeklyByDay)}
            badgeInsight
          />
          <TimelineBarChart
            data={monthlyByWeek}
            title={es.dashboard.monthly}
            insight={getMonthlyInsight(monthlyByWeek)}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={es.dashboard.sectionBalance}
        subtitle={es.dashboard.balanceGoal}
        defaultOpen={false}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <BalancePieChart data={d} title={es.dashboard.daily} insight={getBalanceInsight(d)} />
          <BalancePieChart data={w} title={es.dashboard.weekly} insight={getBalanceInsight(w)} />
          <BalancePieChart data={m} title={es.dashboard.monthly} insight={getBalanceInsight(m)} />
        </div>
      </CollapsibleSection>
    </div>
  );
}
