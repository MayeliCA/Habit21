import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import type { Category } from '@shared/types/enums';
import type { ActivityWithLog } from '@shared/types/schedule';
import { DayTabs } from '@/components/schedule/DayTabs';
import { ActivityRow } from '@/components/schedule/ActivityRow';
import { AddActivityForm } from '@/components/schedule/AddActivityForm';
import { Rocket, Plus, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import { TimelineBar } from '@/components/schedule/TimelineBar';
import { toast } from 'sonner';

function hasOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function formatOverlapDays(dayNumbers: number[]): string {
  const names = dayNumbers.map((d) => es.schedule.fullDays[String(d)]);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function calcCoveredHours(activities: ActivityWithLog[]): number {
  let total = 0;
  for (const a of activities) {
    const start = timeToMinutes(a.time);
    const end = a.endTime ? timeToMinutes(a.endTime) : start + 45;
    total += end - start;
  }
  return total / 60;
}

type CoverageLevel = 'low' | 'light' | 'balanced' | 'heavy' | 'overload';

const COVERAGE_MESSAGES: Record<CoverageLevel, string> = {
  low: es.schedule.coverageLow,
  light: es.schedule.coverageLight,
  balanced: '',
  heavy: es.schedule.coverageHeavy,
  overload: es.schedule.coverageOverload,
};

function getCoverageLevel(hours: number): CoverageLevel {
  if (hours < 5) return 'low';
  if (hours < 8) return 'light';
  if (hours < 13) return 'balanced';
  if (hours < 16) return 'heavy';
  return 'overload';
}

export default function Schedule() {
  const { user } = useAuth();
  const today = useToday(user?.timezone);
  const [activeDay, setActiveDay] = useState<number>(new Date(today + 'T12:00:00').getDay());
  const [allActivities, setAllActivities] = useState<ActivityWithLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFormOpen, setMobileFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveDay(new Date(today + 'T12:00:00').getDay());
  }, [today]);

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
  const coveredHours = calcCoveredHours(dayActivities);
  const coverageLevel = getCoverageLevel(coveredHours);

  const handleAdd = async (daysOfWeek: number[], time: string, endTime: string, category: Category, activity: string): Promise<boolean> => {
    const overlapDays: number[] = [];

    for (const day of daysOfWeek) {
      const existing = allActivities.filter((a) => a.daysOfWeek.includes(day));
      const overlaps = existing.some((a) => hasOverlap(time, endTime, a.time, a.endTime));
      if (overlaps) overlapDays.push(day);
    }

    if (overlapDays.length > 0) {
      toast.error(es.schedule.scheduleOverlap.replace('{days}', formatOverlapDays(overlapDays)));
      return false;
    }

    await api.post('/schedule', { daysOfWeek, time, endTime, category, activity });
    await fetchActivities();
    setMobileFormOpen(false);
    return true;
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
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-4 page-fade-in">
      <div className="shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{es.schedule.title}</h1>
          <span className="text-xs text-muted-foreground">
            {es.schedule.hoursPlanned.replace('{hours}', coveredHours % 1 === 0 ? `${coveredHours}h` : `${coveredHours.toFixed(1)}h`)}
          </span>
        </div>
        <div className="mt-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                coverageLevel === 'overload'
                  ? 'bg-danger animate-pulse'
                  : coverageLevel === 'heavy'
                    ? 'bg-warning'
                    : coverageLevel === 'balanced'
                      ? 'bg-success'
                      : coverageLevel === 'light'
                        ? 'bg-warning'
                        : 'bg-danger'
              }`}
              style={{ width: `${Math.min((coveredHours / 18) * 100, 100)}%` }}
            />
          </div>
          {coverageLevel !== 'balanced' && dayActivities.length > 0 && (
            <p className={`mt-1 text-xs font-medium ${
              coverageLevel === 'overload' || coverageLevel === 'low' ? 'text-danger' : coverageLevel === 'heavy' ? 'text-warning' : 'text-warning-dark'
            }`}>
              {COVERAGE_MESSAGES[coverageLevel]}
            </p>
          )}
        </div>
      </div>

      <DayTabs active={activeDay} onChange={setActiveDay} />

      {dayActivities.length > 0 && (
        <div className="shrink-0">
          <TimelineBar activities={dayActivities} />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {dayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-8">
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
          </div>
        ) : (
          <div className="relative ml-3">
            <div className="absolute left-0 top-3 bottom-3 w-px bg-border" />
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
      </div>

      <div ref={formRef} className="shrink-0 rounded-xl border bg-card p-3 sm:p-5 shadow-sm hidden md:block">
        <AddActivityForm disabled={totalCount >= 18} onSubmit={handleAdd} />
      </div>

      {totalCount < 18 && (
        <button
          onClick={() => setMobileFormOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      )}

      {mobileFormOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileFormOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card p-4 shadow-xl fade-in-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{es.schedule.addActivity}</h2>
              <button
                onClick={() => setMobileFormOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <AddActivityForm disabled={totalCount >= 18} onSubmit={handleAdd} />
          </div>
        </div>
      )}
    </div>
  );
}
