import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { es } from '@/i18n/es';
import { formatTime } from '@/lib/format';

interface TimelineBarChartProps {
  data: { planned: number; completed: number; label: string }[];
  title: string;
  insight?: string;
}

export function TimelineBarChart({ data, title, insight }: TimelineBarChartProps) {
  const hasData = data.some((d) => d.planned > 0 || d.completed > 0);

  if (!hasData) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">{title}</h3>
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          {es.dashboard.noData}
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.label,
    planned: d.planned,
    completed: d.completed,
  }));

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={155}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis width={50} tick={{ fontSize: 10 }} tickMargin={2} tickFormatter={(v: number) => formatTime(v)} />
          <Tooltip
            formatter={(value: number) => [formatTime(value), undefined]}
          />
          <Legend />
          <Bar
            dataKey="completed"
            name={es.dashboard.completed}
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="planned"
            name={es.dashboard.planned}
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-24 text-muted-foreground">
              {d.label}:
            </span>
            <span>{formatTime(d.completed)}/{formatTime(d.planned)}</span>
          </div>
        ))}
      </div>
      {insight && (
        <p className="mt-3 text-xs italic text-muted-foreground">{insight}</p>
      )}
    </div>
  );
}
