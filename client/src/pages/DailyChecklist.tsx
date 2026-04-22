import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import { ComplianceBar } from '@/components/streaks/ComplianceBar';
import { BookOpen, Heart, Coffee, Gamepad2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { formatClockTime } from '@/lib/format';
import confetti from 'canvas-confetti';
import type { ActivityWithLog } from '@shared/types/schedule';
import type { Category } from '@shared/types/enums';

const CATEGORY_ICON: Record<Category, React.ElementType> = {
  academic: BookOpen,
  vital: Heart,
  personal: Coffee,
  escape: Gamepad2,
};

const CATEGORY_ICON_COLOR: Record<Category, string> = {
  academic: 'text-blue-500',
  vital: 'text-green-500',
  personal: 'text-purple-500',
  escape: 'text-amber-500',
};

const CATEGORY_DOT: Record<Category, string> = {
  academic: 'bg-blue-500',
  vital: 'bg-green-500',
  personal: 'bg-purple-500',
  escape: 'bg-amber-500',
};

export default function DailyChecklist() {
  const [activities, setActivities] = useState<ActivityWithLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    api
      .get<ActivityWithLog[]>('/tasks', { params: { date: today } })
      .then((res) => setActivities(res.data))
      .finally(() => setLoading(false));
  }, [today]);

  const toggleDone = async (activityId: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? { ...a, log: a.log ? { ...a.log, done: !a.log.done } : { id: '', activityId, userId: '', date: today, done: true, doneAt: new Date().toISOString() } }
          : a
      )
    );

    try {
      const { data } = await api.patch<ActivityWithLog>(`/tasks/${activityId}/toggle`, {}, {
        params: { date: today },
      });
      setActivities((prev) => prev.map((a) => (a.id === activityId ? data : a)));
    } catch (err) {
      console.error('Failed to toggle activity:', err);
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activityId
            ? { ...a, log: a.log ? { ...a.log, done: !a.log.done } : null }
            : a
        )
      );
    }
  };

  const total = activities.length;
  const completed = activities.filter((a) => a.log?.done).length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const allDone = total > 0 && completed === total;
  const [celebrated100, setCelebrated100] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allDone && !celebrated100 && settings.celebrationsEnabled) {
      setCelebrated100(true);
      const rect = listRef.current?.getBoundingClientRect();
      const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
      const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { x, y },
        colors: ['#22c55e', '#16a34a', '#fbbf24', '#3b82f6', '#a855f7'],
      });
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
        confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
      }, 300);
    }
    if (!allDone) setCelebrated100(false);
  }, [allDone, celebrated100, settings.celebrationsEnabled]);

  if (loading) {
    return (
      <div className="space-y-6 page-fade-in">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-44 rounded-lg" />
          <div className="skeleton h-5 w-28 rounded" />
        </div>
        <div className="skeleton h-16 w-full rounded-xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{es.checklist.todayTasks}</h1>
        <span className="text-sm text-muted-foreground">{today}</span>
      </div>

      {total > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <ComplianceBar compliancePct={pct} passed={pct >= settings.successThreshold} />
        </div>
      )}

      {activities.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          {es.checklist.noTasks}
        </div>
      ) : (
        <div ref={listRef} className="relative ml-3">
          <div className="absolute left-0 top-3 bottom-3 w-px bg-border" />
          <div className="space-y-2">
            {activities.map((a) => {
              const isDone = a.log?.done ?? false;
              const Icon = CATEGORY_ICON[a.category] ?? BookOpen;
              return (
                <div key={a.id} className="flex items-center">
                  <div className="relative z-10 -ml-3 flex shrink-0 items-center justify-center">
                    <div className={`h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${CATEGORY_DOT[a.category]}`} />
                  </div>

                  <div className={`ml-3 flex flex-1 items-center gap-3 rounded-xl border bg-card py-3 pr-4 pl-4 shadow-sm transition-all ${isDone ? 'opacity-60' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleDone(a.id)}
                      className="h-5 w-5 shrink-0 rounded border-gray-300 accent-primary cursor-pointer"
                    />
                    <span className={`shrink-0 whitespace-nowrap text-sm font-mono ${isDone ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}>
                      {formatClockTime(a.time, settings.timeFormat)}{a.endTime ? `–${formatClockTime(a.endTime, settings.timeFormat)}` : ''}
                    </span>
                    <Icon className={`h-4 w-4 shrink-0 ${CATEGORY_ICON_COLOR[a.category]}`} strokeWidth={1.5} />
                    <span className={`flex-1 text-sm font-medium ${isDone ? 'text-muted-foreground/40' : ''}`}>
                      {a.activity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
