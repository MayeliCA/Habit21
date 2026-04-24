import { Trophy, Target, RotateCcw, TrendingDown } from 'lucide-react';
import type { StreakHistory } from '@shared/types/streak';
import { es } from '@/i18n/es';

interface StreakKPIsProps {
  history: StreakHistory;
}

const KPI_ITEMS = [
  { key: 'bestStreak', icon: Trophy, color: 'text-warning', colorBg: 'bg-warning-light' },
  { key: 'totalAttempts', icon: Target, color: 'text-academic', colorBg: 'bg-academic-light' },
  { key: 'recoveryRate', icon: RotateCcw, color: 'text-personal', colorBg: 'bg-personal-light' },
  { key: 'avgDaysBeforeFail', icon: TrendingDown, color: 'text-danger', colorBg: 'bg-danger-light' },
] as const;

function getValue(history: StreakHistory, key: string): string {
  if (key === 'bestStreak') return `${history.bestStreak}d`;
  if (key === 'totalAttempts') return `${history.totalAttempts}`;
  if (key === 'recoveryRate') return `${history.recoveryRate}%`;
  if (key === 'avgDaysBeforeFail') return history.avgDaysBeforeFail > 0 ? `${history.avgDaysBeforeFail}d` : '—';
  return '';
}

function getLabel(key: string): string {
  if (key === 'bestStreak') return es.streakHistory.bestStreak;
  if (key === 'totalAttempts') return es.streakHistory.totalAttempts;
  if (key === 'recoveryRate') return es.streakHistory.recoveryRate;
  if (key === 'avgDaysBeforeFail') return es.streakHistory.avgDaysBeforeFail;
  return '';
}

export function StreakKPIs({ history }: StreakKPIsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {KPI_ITEMS.map(({ key, icon: Icon, color, colorBg }) => (
        <div key={key} className={`flex flex-col items-center gap-1.5 rounded-lg ${colorBg} px-2 py-2 sm:px-3 sm:py-3`}>
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-base font-bold leading-none">{getValue(history, key)}</span>
          <span className="text-[0.625rem] text-muted-foreground leading-tight text-center">{getLabel(key)}</span>
        </div>
      ))}
    </div>
  );
}
