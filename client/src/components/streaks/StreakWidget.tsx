import type { StreakPreview } from '@shared/types/streak';
import { es } from '@/i18n/es';

interface StreakWidgetProps {
  currentDay: number;
  status: StreakPreview['status'];
  failureMode: 'reset' | 'stall';
}

export function StreakWidget({ currentDay, status, failureMode }: StreakWidgetProps) {
  const progress = Math.min((currentDay / 21) * 100, 100);

  const statusLabel =
    status === 'completed'
      ? es.streak.completed
      : status === 'failed'
        ? es.streak.failed
        : es.streak.active;

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">
          {es.streak.dayOf.replace('{current}', String(currentDay))}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            status === 'completed'
              ? 'bg-green-100 text-green-700'
              : status === 'failed'
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
            status === 'completed'
              ? 'bg-green-500'
              : status === 'failed'
                ? 'bg-red-500'
                : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {failureMode === 'reset' ? 'Fallo = reiniciar desde día 1' : 'Fallo = día se repite'}
      </p>
    </div>
  );
}
