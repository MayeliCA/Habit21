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

  const pastDays = data.filter((d) => d.date <= today);
  const passedDays = pastDays.filter((d) => d.passed);

  let bestStreak = 0;
  let currentStreak = 0;
  for (const d of pastDays) {
    if (d.passed) {
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  return (
    <div className="flex flex-col rounded-lg border bg-card px-3 py-3 shadow-sm monthly-card md:h-full md:py-2">
      <div className="mb-2 flex items-center justify-between md:mb-1.5">
        <button
          onClick={() => canGoPrev && onMonthChange(prevMonth)}
          disabled={!canGoPrev}
          className={`rounded-md p-0.5 transition-colors ${canGoPrev ? 'hover:bg-accent text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'}`}
        >
          <ChevronLeft className="h-3.5 w-3.5 monthly-nav-icon" />
        </button>
        <span className="text-xs font-semibold text-muted-foreground">{monthLabel}</span>
        <button
          onClick={() => canGoNext && onMonthChange(nextMonth)}
          disabled={!canGoNext}
          className={`rounded-md p-0.5 transition-colors ${canGoNext ? 'hover:bg-accent text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'}`}
        >
          <ChevronRight className="h-3.5 w-3.5 monthly-nav-icon" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center monthly-grid md:gap-0.5">
        {es.dashboard.dayHeaders.map((h) => (
          <div key={h} className="text-[0.625rem] font-bold uppercase text-muted-foreground py-0.5">
            {h}
          </div>
        ))}

        {calendarCells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} />;

          const dayData = dataMap.get(cell.date);
          const isToday = cell.date === today;
          const isFuture = cell.date > today;

          let dotColor = 'bg-muted-foreground/10';
          if (!isFuture && dayData) {
            if (dayData.passed) dotColor = 'bg-success';
            else if (dayData.pct >= 50) dotColor = 'bg-warning';
            else if (dayData.pct > 0) dotColor = 'bg-danger';
            else dotColor = 'bg-muted-foreground/20';
          }

          return (
            <div
              key={cell.date}
              className={`flex h-7 items-center justify-center rounded text-[0.5625rem] font-semibold md:h-6 ${
                isToday ? 'ring-2 ring-primary' : ''
              } ${dotColor} ${!isFuture && dayData && dayData.pct > 0 ? 'text-white' : 'text-muted-foreground'}`}
              title={dayData ? `${cell.date}: ${dayData.pct.toFixed(0)}%` : cell.date}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      {pastDays.length > 0 && (
        <div className="flex flex-1 items-center mt-2">
          <div className="w-full grid grid-cols-2 gap-2 md:gap-1.5">
          <div className="rounded-md bg-muted/50 px-3 py-2 text-center md:px-2 md:py-1.5">
            <p className="text-xs font-bold tabular-nums">
              {es.dashboard.monthDaysPassed.replace('{passed}', String(passedDays.length)).replace('{total}', String(pastDays.length))}
            </p>
            <p className="text-[0.5625rem] text-muted-foreground">{es.dashboard.passed}</p>
          </div>
          <div className="rounded-md bg-muted/50 px-3 py-2 text-center md:px-2 md:py-1.5">
            <p className="text-xs font-bold tabular-nums">
              {bestStreak > 0 ? es.dashboard.monthStreakDays.replace('{count}', String(bestStreak)) : '–'}
            </p>
            <p className="text-[0.5625rem] text-muted-foreground">{es.dashboard.monthStreak}</p>
          </div>
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-[0.5625rem] text-muted-foreground md:gap-1.5 md:pt-0">
        <span className="flex items-center gap-0.5"><span className="inline-block h-2 w-2 rounded-sm bg-success" />{es.dashboard.legendPassed}</span>
        <span className="flex items-center gap-0.5"><span className="inline-block h-2 w-2 rounded-sm bg-warning" />{es.dashboard.legendPartial}</span>
        <span className="flex items-center gap-0.5"><span className="inline-block h-2 w-2 rounded-sm bg-danger" />{es.dashboard.legendFailed}</span>
        <span className="flex items-center gap-0.5"><span className="inline-block h-2 w-2 rounded-sm bg-muted-foreground/20" />{es.dashboard.legendNoData}</span>
      </div>
    </div>
  );
}
