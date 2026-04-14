import type { SuccessMetric } from '@shared/types/analytics';
import { es } from '@/i18n/es';

interface SuccessMetricCardProps {
  metric: SuccessMetric;
}

function getColorClass(rate: number): string {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 50) return 'text-amber-500';
  return 'text-red-600';
}

export function SuccessMetricCard({ metric }: SuccessMetricCardProps) {
  const rate = metric.globalRate;
  const colorClass = getColorClass(rate);
  const isConstant = rate >= 80;
  const last7Passed = metric.last7Days.filter((d) => d.passed).length;
  const last7Total = metric.last7Days.length;

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{es.dashboard.successMetric}</h2>
          <p className="text-xs text-muted-foreground">{es.dashboard.successSubtitle}</p>
        </div>
        <div className="text-right">
          <span className={'text-2xl font-bold ' + colorClass}>
            {rate.toFixed(1)}%
          </span>
          <div className="mt-1 flex items-center justify-end gap-1.5">
            {isConstant ? (
              <>
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-green-600">{es.dashboard.levelConstant}</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 10a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-amber-500">{es.dashboard.levelInProgress}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs">
        <span className={colorClass + ' font-medium'}>
          {es.dashboard.monthProgress
            .replace('{passed}', String(metric.monthDaysPassed))
            .replace('{total}', String(metric.monthDaysTotal))}
        </span>
      </div>

      {last7Total > 0 && (
        <div className="mt-3 border-t pt-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {metric.last7Days.map((day) => (
                <span
                  key={day.date}
                  className={
                    'inline-block h-4 w-4 rounded-full border-2 ' +
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
