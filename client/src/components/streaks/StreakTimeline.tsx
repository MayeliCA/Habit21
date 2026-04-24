import type { StreakAttempt } from '@shared/types/streak';
import { es } from '@/i18n/es';

interface StreakTimelineProps {
  attempts: StreakAttempt[];
  bestStreak: number;
}

function getStatusConfig(status: StreakAttempt['status'], isBest: boolean) {
  if (status === 'completed') return { barClass: 'bg-success', label: es.streakHistory.completed, labelClass: 'text-success-dark' };
  if (status === 'active') return { barClass: 'bg-academic', label: es.streakHistory.active, labelClass: 'text-academic-dark' };
  if (isBest) return { barClass: 'bg-warning', label: `${es.streakHistory.failed} ★`, labelClass: 'text-warning-dark' };
  return { barClass: 'bg-danger', label: es.streakHistory.failed, labelClass: 'text-danger' };
}

export function StreakTimeline({ attempts, bestStreak }: StreakTimelineProps) {
  if (attempts.length === 0) return null;

  const visible = attempts.slice(-5);

  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <h3 className="mb-2 text-xs font-semibold">{es.streakHistory.timelineTitle}</h3>
      <div className="space-y-1.5">
        {visible.map((attempt) => {
          const widthPct = Math.max((attempt.currentDay / 21) * 100, 4);
          const config = getStatusConfig(attempt.status, attempt.currentDay === bestStreak && attempt.status === 'failed');

          return (
            <div key={attempt.attemptNumber} className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-right text-[0.625rem] text-muted-foreground">
                #{attempt.attemptNumber}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${config.barClass}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-[0.625rem] font-medium text-right">{attempt.currentDay}d</span>
              <span className={`w-16 shrink-0 text-right text-[0.625rem] font-medium ${config.labelClass}`}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
