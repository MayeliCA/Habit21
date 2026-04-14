import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CategoryBreakdown } from '@shared/types/analytics';
import type { Category } from '@shared/types/enums';
import { es } from '@/i18n/es';
import { formatTime } from '@/lib/format';

const CATEGORY_COLORS: Record<Category, string> = {
  academic: '#3b82f6',
  vital: '#22c55e',
  personal: '#a855f7',
  escape: '#f59e0b',
};

interface BalancePieChartProps {
  data: CategoryBreakdown[];
  title: string;
  insight?: string;
  compact?: boolean;
}

export function BalancePieChart({ data, title, insight, compact }: BalancePieChartProps) {
  const chartData = data
    .filter((d) => d.plannedMinutes > 0)
    .map((d) => ({
      name: es.category[d.category].split('(')[0].trim(),
      value: d.plannedMinutes,
      category: d.category,
    }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className={`rounded-lg border bg-card shadow-sm ${compact ? 'p-3' : 'p-6'}`}>
        <h3 className={`font-semibold ${compact ? 'mb-1 text-xs' : 'mb-4 text-sm'}`}>{title}</h3>
        <div className={`flex items-center justify-center text-muted-foreground ${compact ? 'h-10 text-xs' : 'h-48'}`}>
          {es.dashboard.noData}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-card shadow-sm ${compact ? 'p-3' : 'p-4'}`}>
      <h3 className={`font-semibold ${compact ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}>{title}</h3>
      <ResponsiveContainer width="100%" height={compact ? 100 : 155}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={compact ? 25 : 35}
            outerRadius={compact ? 45 : 60}
            paddingAngle={3}
            dataKey="value"
            label={compact
              ? ({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`
              : (({ name, percent }: { name: string; percent: number }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              )
            }
            labelLine={false}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category as Category]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatTime(value), undefined]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className={`space-y-0.5 ${compact ? 'mt-1' : 'mt-2 space-y-1'}`}>
        {data.map((d) => (
          <div key={d.category} className={`flex items-center gap-2 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            <span
              className={`inline-block rounded-full ${compact ? 'h-2 w-2' : 'h-3 w-3'}`}
              style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
            />
            <span className="text-muted-foreground">
              {es.category[d.category].split('(')[0].trim()}:
            </span>
            <span>{formatTime(d.plannedMinutes)}</span>
          </div>
        ))}
      </div>
      {insight && (
        <p className={`italic text-muted-foreground ${compact ? 'mt-1 text-[10px]' : 'mt-3 text-xs'}`}>{insight}</p>
      )}
    </div>
  );
}
