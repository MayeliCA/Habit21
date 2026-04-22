import { BookOpen, Heart, Coffee, Gamepad2 } from 'lucide-react';
import type { CategoryBreakdown } from '@shared/types/analytics';
import type { Category } from '@shared/types/enums';
import { es } from '@/i18n/es';
import { formatTime } from '@/lib/format';

const CATEGORY_CONFIG: Record<Category, {
  color: string;
  bgTrack: string;
  icon: React.ElementType;
}> = {
  academic: { color: 'bg-blue-500', bgTrack: 'bg-blue-100', icon: BookOpen },
  vital: { color: 'bg-green-500', bgTrack: 'bg-green-100', icon: Heart },
  personal: { color: 'bg-purple-500', bgTrack: 'bg-purple-100', icon: Coffee },
  escape: { color: 'bg-amber-500', bgTrack: 'bg-amber-100', icon: Gamepad2 },
};

interface CategoryProgressBarsProps {
  data: CategoryBreakdown[];
}

export function CategoryProgressBars({ data }: CategoryProgressBarsProps) {
  const hasData = data.some((d) => d.plannedMinutes > 0 || d.completedMinutes > 0);

  if (!hasData) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm text-center text-sm text-muted-foreground">
        {es.dashboard.noData}
      </div>
    );
  }

  const categories = data.filter((d) => d.plannedMinutes > 0);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      {categories.map((d) => {
        const cfg = CATEGORY_CONFIG[d.category];
        const Icon = cfg.icon;
        const pct = d.plannedMinutes > 0
          ? Math.min((d.completedMinutes / d.plannedMinutes) * 100, 100)
          : 0;
        const label = es.category[d.category].split('(')[0].trim();

        return (
          <div key={d.category} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${cfg.color.replace('bg-', 'text-')}`} strokeWidth={2} />
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTime(d.completedMinutes)} / {formatTime(d.plannedMinutes)}
              </span>
            </div>
            <div className={`h-3 w-full overflow-hidden rounded-full ${cfg.bgTrack}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${cfg.color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {d.activities.completed}/{d.activities.planned} {es.dashboard.activities}
              </span>
              <span className={`text-xs font-semibold ${
                pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'
              }`}>
                {Math.round(pct)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
