import { es } from '@/i18n/es';
import { formatTime } from '@/lib/format';
import { Check, X } from 'lucide-react';
import type { DayActivityDetail } from '@shared/types/analytics';
import type { Category } from '@shared/types/enums';

const CATEGORY_DOT: Record<Category, string> = {
  academic: 'bg-academic',
  vital: 'bg-vital',
  personal: 'bg-personal',
  escape: 'bg-escape',
};

interface DayDetailProps {
  activities: DayActivityDetail[];
  loading: boolean;
  date: string;
}

export function DayDetail({ activities, loading, date }: DayDetailProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-5 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card p-4 shadow-sm">
        <p className="text-xs text-muted-foreground">{es.dashboard.noActivitiesDay}</p>
      </div>
    );
  }

  const doneCount = activities.filter((a) => a.done).length;
  const plannedMin = activities.reduce((s, a) => {
    const [h1, m1] = a.time.split(':').map(Number);
    const [h2, m2] = a.endTime.split(':').map(Number);
    return s + (h2 * 60 + m2) - (h1 * 60 + m1);
  }, 0);
  const doneMin = activities.filter((a) => a.done).reduce((s, a) => {
    const [h1, m1] = a.time.split(':').map(Number);
    const [h2, m2] = a.endTime.split(':').map(Number);
    return s + (h2 * 60 + m2) - (h1 * 60 + m1);
  }, 0);

  const overallPct = plannedMin > 0 ? Math.round((doneMin / plannedMin) * 100) : 0;

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">{es.dashboard.dayDetail}</span>
          <span className="text-[0.625rem] text-muted-foreground">
            {doneCount}/{activities.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.625rem] text-muted-foreground">{formatTime(doneMin)}/{formatTime(plannedMin)}</span>
          <span className={`text-xs font-bold tabular-nums ${overallPct >= 80 ? 'text-success-dark' : overallPct >= 50 ? 'text-warning-dark' : 'text-danger'}`}>
            {overallPct}%
          </span>
        </div>
      </div>
      <div className="h-1 w-full bg-muted/50">
        <div
          className={`h-full transition-all duration-500 ${overallPct >= 80 ? 'bg-success' : overallPct >= 50 ? 'bg-warning' : 'bg-danger'}`}
          style={{ width: `${Math.min(overallPct, 100)}%` }}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-1.5 scrollbar-thin">
        <div className="flex flex-col">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center gap-2.5 py-1">
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${a.done ? 'bg-success' : 'bg-muted'}`}>
                {a.done
                  ? <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  : <X className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={3} />
                }
              </div>
              <span className={`h-2 w-2 shrink-0 rounded-full ${CATEGORY_DOT[a.category]}`} />
              <span className={`flex-1 truncate text-xs ${a.done ? 'font-medium' : 'text-muted-foreground'}`}>
                {a.activity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
