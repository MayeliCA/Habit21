import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import type { Category } from '@shared/types/enums';
import type { ActivityWithLog } from '@shared/types/schedule';
import { DayTabs } from '@/components/schedule/DayTabs';
import { ActivityRow } from '@/components/schedule/ActivityRow';
import { AddActivityForm } from '@/components/schedule/AddActivityForm';
import { Rocket, ArrowDown } from 'lucide-react';

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<number>(new Date().getDay());
  const [allActivities, setAllActivities] = useState<ActivityWithLog[]>([]);
  const [loading, setLoading] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

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
    await api.delete('/schedule/' + id);
    await fetchActivities();
  };

  if (loading) {
    return (
      <div className="space-y-6 page-fade-in">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="flex justify-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-9 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{es.schedule.title}</h1>
        <span className="text-sm text-muted-foreground">
          {es.schedule.totalActivities.replace('{count}', String(totalCount))}
        </span>
      </div>

      <DayTabs active={activeDay} onChange={setActiveDay} />

      {dayActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-12">
          <div className="relative">
            <Rocket className="h-16 w-16 text-slate-200" strokeWidth={1} />
            <svg className="absolute -right-6 top-1 h-10 w-10 text-slate-200/60" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3">
              <path d="M5 35 Q10 10 35 5" />
            </svg>
          </div>
          <div className="max-w-sm space-y-2 text-center">
            <h2 className="text-lg font-semibold">{es.schedule.emptyTitle}</h2>
            <p className="text-sm text-muted-foreground">{es.schedule.emptySubtitle}</p>
          </div>
          <button
            onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="flex flex-col items-center gap-1 text-muted-foreground/40 transition-colors hover:text-primary"
          >
            <span className="text-xs">{es.schedule.addActivity}</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </button>
        </div>
      ) : (
        <div className="relative ml-3">
          <div className="absolute left-0 top-3 bottom-3 w-px bg-gray-200" />
          <div className="space-y-2">
            {dayActivities.map((item) => (
              <ActivityRow
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {totalCount >= 18 && (
        <p className="text-sm font-medium text-amber-600">{es.schedule.maxReached}</p>
      )}

      <div ref={formRef} className="rounded-xl border bg-card p-5 shadow-sm">
        <AddActivityForm disabled={false} onSubmit={handleAdd} />
      </div>
    </div>
  );
}
