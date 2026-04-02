import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import type { Category } from '@shared/types/enums';
import type { ActivityWithLog } from '@shared/types/schedule';
import { DayTabs } from '@/components/schedule/DayTabs';
import { ActivityRow } from '@/components/schedule/ActivityRow';
import { AddActivityForm } from '@/components/schedule/AddActivityForm';

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<number>(new Date().getDay());
  const [allActivities, setAllActivities] = useState<ActivityWithLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    const res = await api.get<ActivityWithLog[]>('/schedule');
    setAllActivities(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const dayActivities = allActivities.filter((a) => a.daysOfWeek.includes(activeDay));
  const totalCount = dayActivities.length;

  const handleAdd = async (daysOfWeek: number[], time: string, endTime: string, category: Category, activity: string) => {
    await api.post('/schedule', { daysOfWeek, time, endTime, category, activity });
    await fetchActivities();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(es.schedule.confirmDelete)) return;
    await api.delete('/schedule/' + id);
    await fetchActivities();
  };

  if (loading) {
    return <p className="text-muted-foreground">{es.common.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{es.schedule.title}</h1>
        <span className="text-sm text-muted-foreground">
          {es.schedule.totalActivities.replace('{count}', String(totalCount))}
        </span>
      </div>

      <DayTabs active={activeDay} onChange={setActiveDay} />

      {dayActivities.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          {es.schedule.noActivities}
        </div>
      ) : (
        <div className="space-y-2">
          {dayActivities.map((item) => (
            <ActivityRow
              key={item.id}
              item={item}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {totalCount >= 18 && (
        <p className="text-sm font-medium text-amber-600">{es.schedule.maxReached}</p>
      )}

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <AddActivityForm disabled={false} onSubmit={handleAdd} />
      </div>
    </div>
  );
}
