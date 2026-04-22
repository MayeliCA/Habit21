import { es } from '@/i18n/es';
import { formatClockTime, formatTime } from '@/lib/format';
import { useSettings } from '@/hooks/useSettings';
import { BookOpen, Heart, Coffee, Gamepad2, Check, X } from 'lucide-react';
import type { DayActivityDetail } from '@shared/types/analytics';
import type { Category } from '@shared/types/enums';

const CATEGORY_ICON: Record<Category, React.ElementType> = {
  academic: BookOpen,
  vital: Heart,
  personal: Coffee,
  escape: Gamepad2,
};

const CATEGORY_DOT: Record<Category, string> = {
  academic: 'bg-blue-500',
  vital: 'bg-green-500',
  personal: 'bg-purple-500',
  escape: 'bg-amber-500',
};

const CATEGORY_BADGE_BG: Record<Category, string> = {
  academic: 'bg-blue-100 text-blue-700',
  vital: 'bg-green-100 text-green-700',
  personal: 'bg-purple-100 text-purple-700',
  escape: 'bg-amber-100 text-amber-700',
};

interface DayDetailProps {
  activities: DayActivityDetail[];
  loading: boolean;
  date: string;
}

export function DayDetail({ activities, loading, date }: DayDetailProps) {
  const { settings } = useSettings();

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{es.dashboard.noActivitiesDay}</p>
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
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{es.dashboard.dayDetail}</span>
          <span className="text-xs text-muted-foreground">
            {doneCount}/{activities.length} {es.dashboard.activities}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime(doneMin)}/{formatTime(plannedMin)}</span>
          <span className={`text-sm font-bold tabular-nums ${overallPct >= 80 ? 'text-green-600' : overallPct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
            {overallPct}%
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {activities.map((a) => {
          const Icon = CATEGORY_ICON[a.category];
          const shortLabel = es.categoryShort[a.category];
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-md px-2 py-2 transition-colors ${a.done ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${a.done ? 'bg-green-500' : 'bg-muted'}`}>
                {a.done
                  ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                  : <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2.5} />
                }
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                {formatClockTime(a.time, settings.timeFormat)}–{formatClockTime(a.endTime, settings.timeFormat)}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <div className={`h-2.5 w-2.5 rounded-full ${CATEGORY_DOT[a.category]}`} />
                <Icon className={`h-3.5 w-3.5 ${CATEGORY_DOT[a.category].replace('bg-', 'text-')}`} strokeWidth={1.5} />
              </div>
              <span className={`flex-1 truncate text-sm ${a.done ? 'font-medium' : 'text-muted-foreground'}`}>
                {a.activity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
