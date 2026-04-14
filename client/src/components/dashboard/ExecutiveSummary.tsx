import type { AnalyticsResponse } from '@shared/types/analytics';
import { es } from '@/i18n/es';
import { formatTime } from '@/lib/format';
import { Trophy, TrendingUp, AlertTriangle } from 'lucide-react';

interface ExecutiveSummaryProps {
  analytics: AnalyticsResponse;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-base font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function ExecutiveSummary({ analytics }: ExecutiveSummaryProps) {
  const weeklyByDay = analytics.weeklyByDay ?? [];

  let bestDayValue: string = es.dashboard.execNoData;
  let bestDayDesc: string = es.dashboard.noData;
  if (weeklyByDay.length > 0) {
    const withPlanned = weeklyByDay.filter((d) => d.planned > 0);
    if (withPlanned.length > 0) {
      const best = withPlanned.reduce((a, b) => {
        const pctA = a.completed / a.planned;
        const pctB = b.completed / b.planned;
        return pctA >= pctB ? a : b;
      });
      const pct = ((best.completed / best.planned) * 100).toFixed(0);
      bestDayValue = best.dayLabel;
      bestDayDesc = es.dashboard.execBestDayDesc
        .replace('{day}', best.dayLabel)
        .replace('{pct}', pct);
    }
  }

  const weekTotalCompleted = weeklyByDay.reduce((s, d) => s + d.completed, 0);
  const weekAvgValue = formatTime(weekTotalCompleted);
  const weekAvgDesc = es.dashboard.execWeekAvgDesc.replace(
    '{hours}',
    formatTime(weekTotalCompleted),
  );

  const escapeWeekly = analytics.weekly.find((d) => d.category === 'escape');
  const escapeMinutes = escapeWeekly?.plannedMinutes ?? 0;
  const leakValue = formatTime(escapeMinutes);
  const leakDesc = es.dashboard.execTimeLeakDesc.replace(
    '{hours}',
    formatTime(escapeMinutes),
  );

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard
        icon={Trophy}
        label={es.dashboard.execBestDay}
        value={bestDayValue}
        description={bestDayDesc}
        color="text-green-600"
      />
      <SummaryCard
        icon={TrendingUp}
        label={es.dashboard.execWeekAvg}
        value={weekAvgValue}
        description={weekAvgDesc}
        color="text-blue-600"
      />
      <SummaryCard
        icon={AlertTriangle}
        label={es.dashboard.execTimeLeak}
        value={leakValue}
        description={leakDesc}
        color="text-amber-500"
      />
    </div>
  );
}
