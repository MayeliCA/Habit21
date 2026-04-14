import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CategoryBreakdown } from '@shared/types/analytics';
import { es } from '@/i18n/es';
import { formatTime } from '@/lib/format';

const CATEGORY_COLORS: Record<string, string> = {
  academic: '#3b82f6',
  vital: '#22c55e',
  personal: '#a855f7',
  escape: '#f59e0b',
};

interface CategoryChartProps {
  data: CategoryBreakdown[];
  title: string;
  insight?: string;
  compact?: boolean;
}

export function CategoryChart({ data, title, insight, compact }: CategoryChartProps) {
  const hasData = data.some((d) => d.plannedMinutes > 0 || d.completedMinutes > 0);

  if (!hasData) {
    return (
      <div className={`rounded-lg border bg-card shadow-sm ${compact ? 'p-3' : 'p-6'}`}>
        <h2 className={`font-semibold ${compact ? 'mb-1 text-xs' : 'mb-4 text-lg'}`}>{title}</h2>
        <div className={`flex items-center justify-center text-muted-foreground ${compact ? 'h-10 text-xs' : 'h-48'}`}>
          {es.dashboard.noData}
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: es.category[d.category].split('(')[0].trim(),
    planned: d.plannedMinutes,
    completed: d.completedMinutes,
  }));

  return (
    <div className={`rounded-lg border bg-card shadow-sm ${compact ? 'p-3' : 'p-4'}`}>
      <h2 className={`font-semibold ${compact ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}>{title}</h2>
      <ResponsiveContainer width="100%" height={compact ? 110 : 175}>
        <BarChart data={chartData} margin={compact ? { top: 2, right: 10, left: 0, bottom: 2 } : { top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: compact ? 9 : 11 }} />
          <YAxis width={compact ? 35 : 50} tick={{ fontSize: compact ? 8 : 10 }} tickMargin={2} tickFormatter={(v: number) => formatTime(v)} />
          <Tooltip
            formatter={(value: number) => [formatTime(value), undefined]}
          />
          <Legend
            wrapperStyle={{ fontSize: compact ? '9px' : undefined, paddingTop: compact ? 2 : undefined }}
          />
          <Bar
            dataKey="completed"
            name={es.dashboard.completed}
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="planned"
            name={es.dashboard.planned}
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className={`space-y-0.5 ${compact ? 'mt-1' : 'mt-3 space-y-1'}`}>
        {data.map((d) => (
          <div key={d.category} className={`flex items-center gap-2 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            <span
              className={`inline-block rounded-full ${compact ? 'h-2 w-2' : 'h-3 w-3'}`}
              style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
            />
            <span className="text-muted-foreground">
              {es.category[d.category].split('(')[0].trim()}:
            </span>
            <span>
              {formatTime(d.completedMinutes)}/{formatTime(d.plannedMinutes)}
            </span>
            <span className="text-muted-foreground">
              ({d.activities.completed}/{d.activities.planned} {es.dashboard.activities})
            </span>
          </div>
        ))}
      </div>
      {insight && (
        <p className={`italic text-muted-foreground ${compact ? 'mt-1 text-[10px]' : 'mt-3 text-xs'}`}>{insight}</p>
      )}
    </div>
  );
}
