import { es } from '@/i18n/es';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WeekComparison as WeekComparisonType } from '@shared/types/analytics';

interface WeekComparisonProps {
  data: WeekComparisonType;
}

export function WeekComparison({ data }: WeekComparisonProps) {
  const { thisWeek, lastWeek } = data;
  const diff = thisWeek.avgPct - lastWeek.avgPct;

  const isUp = diff > 0;
  const isDown = diff < 0;
  const absDiff = Math.abs(diff).toFixed(1);

  let TrendIcon = Minus;
  let trendColor = 'text-muted-foreground';
  let trendLabel: string = es.dashboard.weekSame;
  if (isUp) {
    TrendIcon = TrendingUp;
    trendColor = 'text-green-600';
    trendLabel = es.dashboard.weekUp;
  } else if (isDown) {
    TrendIcon = TrendingDown;
    trendColor = 'text-red-500';
    trendLabel = es.dashboard.weekDown;
  }

  const thisPctColor = thisWeek.avgPct >= 80 ? 'text-green-600' : thisWeek.avgPct >= 50 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{es.dashboard.vsLastWeek}</span>
        <div className="flex items-center gap-1">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <span className={`text-xs font-medium ${trendColor}`}>
            {absDiff}% {trendLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{es.dashboard.thisWeek}</p>
          <p className={`text-lg font-bold tabular-nums leading-tight ${thisPctColor}`}>
            {thisWeek.avgPct.toFixed(0)}%
          </p>
          <p className="text-[10px] text-muted-foreground">
            {thisWeek.daysPassed}/{thisWeek.daysTotal} {es.dashboard.passed}
          </p>
        </div>
        <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{es.dashboard.lastWeek}</p>
          <p className="text-lg font-bold tabular-nums leading-tight text-muted-foreground">
            {lastWeek.avgPct.toFixed(0)}%
          </p>
          <p className="text-[10px] text-muted-foreground">
            {lastWeek.daysPassed}/{lastWeek.daysTotal} {es.dashboard.passed}
          </p>
        </div>
      </div>
    </div>
  );
}
