import type { SuccessMetric } from '@shared/types/analytics';
import { es } from '@/i18n/es';

interface SuccessMetricCardProps {
  metric: SuccessMetric;
}

export function SuccessMetricCard({ metric }: SuccessMetricCardProps) {
  const rate = metric.globalRate;
  const isPassing = rate >= 80;
  const last7Passed = metric.last7Days.filter((d) => d.passed).length;
  const last7Total = metric.last7Days.length;

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{es.dashboard.successMetric}</h2>
          <p className="text-sm text-muted-foreground">{es.dashboard.successSubtitle}</p>
        </div>
        <div className="text-right">
          <span
            className={
              'text-4xl font-bold ' +
              (isPassing ? 'text-green-600' : 'text-red-600')
            }
          >
            {rate.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          {metric.daysPassed}/{metric.daysTracked} {es.dashboard.daysPassed}
        </span>
      </div>

      {last7Total > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {metric.last7Days.map((day) => (
                <span
                  key={day.date}
                  className={
                    'inline-block h-5 w-5 rounded-full border-2 ' +
                    (day.passed
                      ? 'border-green-500 bg-green-500'
                      : 'border-slate-300 bg-slate-100')
                  }
                  title={`${day.date}: ${day.pct.toFixed(0)}%`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {es.dashboard.last7Trend
                .replace('{passed}', String(last7Passed))
                .replace('{total}', String(last7Total))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
