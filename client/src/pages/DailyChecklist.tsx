import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import { ComplianceBar } from '@/components/streaks/ComplianceBar';
import type { ActivityWithLog } from '@shared/types/schedule';
import type { Category } from '@shared/types/enums';

const CATEGORY_COLORS: Record<Category, string> = {
  academic: 'bg-blue-100 text-blue-800',
  vital: 'bg-green-100 text-green-800',
  personal: 'bg-purple-100 text-purple-800',
  escape: 'bg-amber-100 text-amber-800',
};

export default function DailyChecklist() {
  const [activities, setActivities] = useState<ActivityWithLog[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    api
      .get<ActivityWithLog[]>('/tasks', { params: { date: today } })
      .then((res) => setActivities(res.data))
      .finally(() => setLoading(false));
  }, [today]);

  const toggleDone = async (activityId: string) => {
    const { data } = await api.patch<ActivityWithLog>(`/tasks/${activityId}/toggle`, null, {
      params: { date: today },
    });
    setActivities((prev) => prev.map((a) => (a.id === activityId ? data : a)));
  };

  const total = activities.length;
  const completed = activities.filter((a) => a.log?.done).length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  if (loading) {
    return <p className="text-muted-foreground">{es.common.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{es.checklist.todayTasks}</h1>
        <span className="text-sm text-muted-foreground">{today}</span>
      </div>

      {total > 0 && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">{es.checklist.todayStatus}</h3>
          <ComplianceBar compliancePct={pct} passed={pct > 80} />
        </div>
      )}

      {activities.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          {es.checklist.noTasks}
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => {
            const isDone = a.log?.done ?? false;
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleDone(a.id)}
                  className="h-4 w-4 rounded border"
                />
                <span className="whitespace-nowrap text-sm font-mono text-muted-foreground">
                  {a.time}{a.endTime ? ` - ${a.endTime}` : ''}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[a.category]}`}>
                  {es.category[a.category]}
                </span>
                <span className={isDone ? 'flex-1 text-sm text-muted-foreground line-through' : 'flex-1 text-sm'}>
                  {a.activity}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
