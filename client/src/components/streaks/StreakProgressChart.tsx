import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { StreakAttempt } from '@shared/types/streak';
import { es } from '@/i18n/es';

interface StreakProgressChartProps {
  attempts: StreakAttempt[];
}

export function StreakProgressChart({ attempts }: StreakProgressChartProps) {
  if (attempts.length < 2) return null;

  const data = attempts.map((a) => ({
    name: `${a.attemptNumber}`,
    days: a.currentDay,
  }));

  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <h3 className="mb-2 text-xs font-semibold">{es.streakHistory.progressTitle}</h3>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 5, right: 16, left: -8, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 21]} width={28} tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value: number) => [`${value} ${es.streakHistory.days}`, undefined]}
          />
          <Line
            type="monotone"
            dataKey="days"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3.5, fill: '#3b82f6' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
