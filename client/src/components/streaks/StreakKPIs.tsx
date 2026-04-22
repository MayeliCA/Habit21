import { Trophy, Target, RotateCcw, TrendingDown } from 'lucide-react';
import type { StreakHistory } from '@shared/types/streak';
import { es } from '@/i18n/es';

interface StreakKPIsProps {
  history: StreakHistory;
}

const KPI_ITEMS = [
  { key: 'bestStreak', icon: Trophy, color: 'text-amber-500', colorBg: 'bg-amber-50' },
  { key: 'totalAttempts', icon: Target, color: 'text-blue-500', colorBg: 'bg-blue-50' },
  { key: 'recoveryRate', icon: RotateCcw, color: 'text-purple-500', colorBg: 'bg-purple-50' },
  { key: 'avgDaysBeforeFail', icon: TrendingDown, color: 'text-red-500', colorBg: 'bg-red-50' },
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
    <div className="grid grid-cols-4 gap-3">
      {KPI_ITEMS.map(({ key, icon: Icon, color, colorBg }) => (
        <div key={key} className={`flex flex-col items-center gap-1.5 rounded-lg ${colorBg} px-3 py-3`}>
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-base font-bold leading-none">{getValue(history, key)}</span>
          <span className="text-[10px] text-muted-foreground leading-tight text-center">{getLabel(key)}</span>
        </div>
      ))}
    </div>
  );
}
