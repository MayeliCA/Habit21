import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CategoryBreakdown } from '@shared/types/analytics';
import { es } from '@/i18n/es';

const CATEGORY_COLORS: Record<string, string> = {
  academic: '#3b82f6',
  vital: '#22c55e',
  personal: '#a855f7',
  escape: '#f59e0b',
};

interface CategoryChartProps {
  data: CategoryBreakdown[];
  title: string;
}

export function CategoryChart({ data, title }: CategoryChartProps) {
  const hasData = data.some((d) => d.plannedMinutes > 0 || d.completedMinutes > 0);

  if (!hasData) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        <div className="flex h-48 items-center justify-center text-muted-foreground">
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
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit={es.dashboard.minutes} />
          <Tooltip
            formatter={(value: number) => [`${value} ${es.dashboard.minutes}`, undefined]}
          />
          <Legend />
          <Bar
            dataKey="planned"
            name={es.dashboard.planned}
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="completed"
            name={es.dashboard.completed}
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1">
        {data.map((d) => (
          <div key={d.category} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
            />
            <span className="text-muted-foreground">
              {es.category[d.category].split('(')[0].trim()}:
            </span>
            <span>
              {d.completedMinutes}/{d.plannedMinutes} {es.dashboard.minutes}
            </span>
            <span className="text-muted-foreground">
              ({d.activities.completed}/{d.activities.planned} {es.dashboard.activities})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
