import type { StreakPreview } from '@shared/types/streak';
import { es } from '@/i18n/es';

interface StreakWidgetProps {
  streakPreview: StreakPreview;
  onLogToday: () => void;
}

export function StreakWidget({ streakPreview, onLogToday }: StreakWidgetProps) {
  const { streak, todayLog, logHistory } = streakPreview;
  const progress = Math.min((streak.currentDay / 21) * 100, 100);

  const statusLabel =
    streak.status === 'completed'
      ? es.streak.completed
      : streak.status === 'failed'
        ? es.streak.failed
        : es.streak.active;

  const canLogToday = streak.status === 'active' && !todayLog;

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">
          {es.streak.dayOf.replace('{current}', String(streak.currentDay))}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            streak.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : streak.status === 'failed'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            streak.status === 'completed'
              ? 'bg-green-500'
              : streak.status === 'failed'
                ? 'bg-red-500'
                : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        {canLogToday && (
          <button
            onClick={onLogToday}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {es.streak.markDone}
          </button>
        )}
        {todayLog && (
          <span className="text-xs font-medium text-green-600">{es.streak.todayDone}</span>
        )}
      </div>

      {logHistory.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {logHistory.map((log) => (
            <span
              key={log.id}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700"
              title={log.date}
            >
              ✓
            </span>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        {es.streak.resetInfo}
      </p>
    </div>
  );
}
