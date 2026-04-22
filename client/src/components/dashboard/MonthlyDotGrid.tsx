import { es } from '@/i18n/es';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DayCompliance } from '@shared/types/analytics';

interface MonthlyDotGridProps {
  data: DayCompliance[];
  today: string;
  currentMonth: string;
  firstLogDate: string | null;
  onMonthChange: (month: string) => void;
}

function getMonthDays(month: string): { date: string; day: number; jsDay: number }[] {
  const [year, mon] = month.split('-').map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  const days: { date: string; day: number; jsDay: number }[] = [];
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${month}-${String(d).padStart(2, '0')}`;
    const jsDay = new Date(dateStr + 'T12:00:00').getDay();
    days.push({ date: dateStr, day: d, jsDay });
  }
  return days;
}

export function MonthlyDotGrid({ data, today, currentMonth, firstLogDate, onMonthChange }: MonthlyDotGridProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
        {es.dashboard.noData}
      </div>
    );
  }

  const days = getMonthDays(currentMonth);
  const dataMap = new Map(data.map((d) => [d.date, d]));

  const [year, mon] = currentMonth.split('-').map(Number);
  const monthLabel = `${es.dashboard.monthNames[mon - 1]} ${year}`;

  const firstDayOfMonth = days.length > 0 ? days[0].jsDay : 1;
  const mondayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const currentMonthStr = today.slice(0, 7);
  const canGoPrev = firstLogDate !== null && currentMonth > firstLogDate.slice(0, 7);
  const canGoNext = currentMonth < currentMonthStr;

  const prevMonth = (() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const pm = m === 1 ? 12 : m - 1;
    const py = m === 1 ? y - 1 : y;
    return `${py}-${String(pm).padStart(2, '0')}`;
  })();

  const nextMonth = (() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    return `${ny}-${String(nm).padStart(2, '0')}`;
  })();

  const calendarCells: (typeof days[0] | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) calendarCells.push(null);
  for (const d of days) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => canGoPrev && onMonthChange(prevMonth)}
          disabled={!canGoPrev}
          className={`rounded-md p-1 transition-colors ${canGoPrev ? 'hover:bg-accent text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <button
          onClick={() => canGoNext && onMonthChange(nextMonth)}
          disabled={!canGoNext}
          className={`rounded-md p-1 transition-colors ${canGoNext ? 'hover:bg-accent text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'}`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {es.dashboard.dayHeaders.map((h) => (
          <div key={h} className="text-[10px] font-bold uppercase text-muted-foreground py-0.5">
            {h}
          </div>
        ))}

        {calendarCells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} />;

          const dayData = dataMap.get(cell.date);
          const isToday = cell.date === today;
          const isFuture = cell.date > today;
          const isPast = cell.date <= today;

          let dotColor = 'bg-muted-foreground/10';
          if (!isFuture && dayData) {
            if (dayData.passed) dotColor = 'bg-green-500';
            else if (dayData.pct >= 50) dotColor = 'bg-amber-500';
            else if (dayData.pct > 0) dotColor = 'bg-red-400';
            else dotColor = 'bg-muted-foreground/20';
          }

          return (
            <div
              key={cell.date}
              className={`flex h-7 items-center justify-center rounded text-[10px] font-semibold ${
                isToday ? 'ring-2 ring-primary' : ''
              } ${dotColor} ${!isFuture && dayData && dayData.pct > 0 ? 'text-white' : 'text-muted-foreground'}`}
              title={dayData ? `${cell.date}: ${dayData.pct.toFixed(0)}%` : cell.date}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t pt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" />{es.dashboard.legendPassed}</span>
        <span className="flex items-center gap-0.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />{es.dashboard.legendPartial}</span>
        <span className="flex items-center gap-0.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" />{es.dashboard.legendFailed}</span>
        <span className="flex items-center gap-0.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted-foreground/20" />{es.dashboard.legendNoData}</span>
      </div>
    </div>
  );
}
