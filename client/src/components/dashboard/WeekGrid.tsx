import { es } from '@/i18n/es';
import { formatTime } from '@/lib/format';
import { useSettings } from '@/hooks/useSettings';
import { Check, X, Minus } from 'lucide-react';
import type { DayTotal } from '@shared/types/analytics';

interface WeekGridProps {
  data: DayTotal[];
  today: string;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function WeekGrid({ data, today, selectedDate, onSelectDate }: WeekGridProps) {
  const { settings } = useSettings();
  const threshold = settings.successThreshold;

  return (
    <div className="grid grid-cols-7 gap-2">
      {data.map((day) => {
        const isFuture = day.date > today;
        const isToday = day.date === today;
        const isSelected = day.date === selectedDate;
        const hasData = day.planned > 0;
        const pct = hasData ? (day.completed / day.planned) * 100 : 0;
        const passed = pct >= threshold;

        let barColor = 'bg-muted-foreground/15';
        if (!isFuture && hasData) {
          barColor = passed ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : pct > 0 ? 'bg-red-400' : 'bg-muted-foreground/25';
        }

        return (
          <button
            key={day.date}
            onClick={() => !isFuture && onSelectDate(day.date)}
            disabled={isFuture}
            className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 transition-all ${
              isSelected
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                : isToday
                  ? 'border-primary/40 bg-card shadow-sm'
                  : isFuture
                    ? 'border-border/40 bg-muted/20 opacity-40'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
            }`}
          >
            <span className={`text-xs font-bold uppercase tracking-wide ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
              {day.dayLabel}
            </span>

            {isFuture || !hasData ? (
              <Minus className="h-4 w-4 text-muted-foreground/30" />
            ) : (
              <>
                <div className="flex items-center gap-1">
                  {passed ? (
                    <Check className="h-4 w-4 text-green-500" strokeWidth={2.5} />
                  ) : (
                    <X className="h-4 w-4 text-red-400" strokeWidth={2.5} />
                  )}
                  <span className="text-sm font-bold tabular-nums">{Math.round(pct)}%</span>
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {formatTime(day.completed)}/{formatTime(day.planned)}
                </span>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </>
            )}

            {isToday && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
