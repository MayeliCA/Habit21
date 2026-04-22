import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import { CategoryProgressBars } from '@/components/dashboard/CategoryProgressBars';
import type { ActivityWithLog } from '@shared/types/schedule';
import type { AnalyticsResponse, CategoryBreakdown, DayTotal } from '@shared/types/analytics';
import type { ScheduleStreak } from '@shared/types/analytics';
import type { StreakPreview } from '@shared/types/streak';
import type { Category } from '@shared/types/enums';
import { ArrowRight, Flame, Star, Crown } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { formatClockTime } from '@/lib/format';

const CATEGORY_COLORS: Record<Category, string> = {
  academic: 'bg-blue-100 text-blue-800',
  vital: 'bg-green-100 text-green-800',
  personal: 'bg-purple-100 text-purple-800',
  escape: 'bg-amber-100 text-amber-800',
};

function getNextActivity(activities: ActivityWithLog[]): ActivityWithLog | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const upcoming = activities
    .filter((a) => !a.log?.done)
    .filter((a) => {
      const [h, m] = a.time.split(':').map(Number);
      return h * 60 + m > nowMinutes;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  if (upcoming.length > 0) return upcoming[0];

  const undone = activities
    .filter((a) => !a.log?.done)
    .sort((a, b) => a.time.localeCompare(b.time));

  return undone.length > 0 ? undone[0] : null;
}

function NextActivityCard({ activities }: { activities: ActivityWithLog[] }) {
  const { settings } = useSettings();
  const allDone = activities.length > 0 && activities.every((a) => a.log?.done);
  const noActivities = activities.length === 0;
  const next = getNextActivity(activities);

  return (
    <Link
      to="/checklist"
      className="group block rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {es.home.nextActivity}
          </p>
          {allDone ? (
            <p className="mt-2 text-lg font-semibold text-green-600">
              {es.home.allDone}
            </p>
          ) : noActivities ? (
            <p className="mt-2 text-lg font-semibold text-muted-foreground">
              {es.home.noActivities}
            </p>
          ) : next ? (
            <>
              <p className="mt-2 text-lg font-semibold">{next.activity}</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono text-sm text-muted-foreground">
                  {formatClockTime(next.time, settings.timeFormat)}{next.endTime ? ` - ${formatClockTime(next.endTime, settings.timeFormat)}` : ''}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[next.category]}`}>
                  {es.category[next.category].split('(')[0].trim()}
                </span>
              </div>
            </>
          ) : null}
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

const DAY_KEYS_BY_JS: Record<number, string> = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };

function ScheduleStreakCard({
  streak,
  pendingStreak,
  weeklyByDay,
}: {
  streak: number;
  pendingStreak: number;
  weeklyByDay: DayTotal[];
}) {
  const { settings } = useSettings();
  const threshold = settings.successThreshold;
  const today = new Date().toISOString().slice(0, 10);

  const todayEntry = weeklyByDay.find((d) => d.date === today);
  const todayPct = todayEntry && todayEntry.planned > 0
    ? (todayEntry.completed / todayEntry.planned) * 100
    : 0;

  const isActive = streak > 0;
  const hasPending = streak === 0 && pendingStreak > 0;

  return (
    <Link
      to="/panel"
      className="group block rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="p-5 pb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {es.home.scheduleStreak}
        </p>

        <div className="mt-3 flex items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-md drop-shadow-[0_0_10px_rgba(251,146,60,0.45)]'
                : 'bg-muted'
            }`}
          >
            <Star
              className={`h-7 w-7 ${isActive ? 'text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]' : 'text-muted-foreground/40'}`}
              strokeWidth={2.5}
            />
          </div>

          <div className="flex-1 min-w-0">
            {isActive ? (
              <p className="text-base font-semibold">
                {es.home.scheduleStreakDays.replace('{count}', String(streak))}
              </p>
            ) : hasPending ? (
              <p className="text-base font-semibold text-muted-foreground">
                {es.home.scheduleStreakDays.replace('{count}', String(pendingStreak))}
              </p>
            ) : (
              <p className="text-base font-semibold text-muted-foreground">
                {es.home.scheduleStreakZero}
              </p>
            )}
            {isActive && todayPct === 100 && (
              <p className="mt-0.5 text-xs font-medium text-green-600">{es.home.scheduleStreakPerfect}</p>
            )}
            {hasPending && (
              <p className="mt-0.5 text-xs text-amber-600">{es.home.scheduleStreakPending}</p>
            )}
          </div>

          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      <div className="border-t px-5 py-3">
        <div className="flex items-center justify-between">
          {weeklyByDay.map((day) => {
            const pct = day.planned > 0 ? (day.completed / day.planned) * 100 : 0;
            const perfect = pct === 100;
            const passed = pct >= threshold;
            const atThreshold = passed && pct < 100 && pct <= threshold + 5;
            const isFuture = day.date > today;

            const jsDay = new Date(day.date + 'T12:00:00').getDay();
            const dayKey = DAY_KEYS_BY_JS[jsDay];
            const label = es.schedule.days[dayKey as keyof typeof es.schedule.days];

            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-medium ${day.date === today ? '' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                <div
                  className={`h-3.5 w-3.5 rounded-full transition-colors ${
                    isFuture
                      ? 'bg-muted'
                      : perfect
                        ? 'bg-green-500 shadow-sm shadow-green-200'
                        : atThreshold
                          ? 'bg-amber-400 shadow-sm shadow-amber-200/50'
                          : passed
                            ? 'bg-amber-500 shadow-sm shadow-amber-200'
                            : day.planned > 0
                              ? 'bg-muted-foreground/30'
                              : 'bg-muted'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

interface StreakEntry {
  habit: { id: string; title: string };
  streak: StreakPreview | null;
  recentlyFailed: boolean;
}

function HabitsStreakCard({ streaks }: { streaks: StreakEntry[] }) {
  const displayedStreaks = streaks.filter((s) => {
    const status = s.streak?.streak.status;
    const day = s.streak?.streak.currentDay ?? 0;
    return (status === 'active' || status === 'completed') && day >= 1;
  });

  const restartableCount = streaks.filter((s) => s.recentlyFailed).length;

  const doneCount = displayedStreaks.filter(
    (s) => !!s.streak?.todayLog || s.streak?.streak.status === 'completed'
  ).length;
  const totalCount = displayedStreaks.length;

  let bestEntry: StreakEntry | null = null;
  let bestDay = 0;
  for (const s of displayedStreaks) {
    const day = s.streak?.streak.currentDay ?? 0;
    if (day > bestDay) {
      bestDay = day;
      bestEntry = s;
    }
  }

  const bestTitle = bestEntry?.habit.title ?? '';
  const bestCompleted = bestEntry?.streak?.streak.status === 'completed';
  const bestIsDone = !!bestEntry?.streak?.todayLog || bestCompleted;
  const isActive = bestDay > 0;

  let message = '';
  if (totalCount === 0) {
    message = restartableCount > 0
      ? es.home.habitsRestartAvailable.replace('{count}', String(restartableCount))
      : es.home.habitsNoneActive;
  } else if (doneCount === totalCount) {
    message = es.home.habitsAllActive;
  } else {
    message = es.home.habitsSomeDone
      .replace('{done}', String(doneCount))
      .replace('{total}', String(totalCount));
  }

  if (restartableCount > 0 && totalCount > 0) {
    message += ' ' + es.home.habitsRestartAvailable.replace('{count}', String(restartableCount));
  }

  return (
    <Link
      to="/habits"
      className="group block rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="p-5 pb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {es.home.habitsStreak}
        </p>

        <div className="mt-3 flex items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              isActive && bestIsDone
                ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-md drop-shadow-[0_0_10px_rgba(251,146,60,0.45)]'
                : 'bg-muted'
            }`}
          >
            {bestCompleted ? (
              <Crown className="h-7 w-7 text-amber-200 drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
            ) : (
              <Flame
                className={`h-7 w-7 ${
                  isActive && bestIsDone
                    ? 'text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]'
                    : 'text-muted-foreground/40'
                }`}
                strokeWidth={2.5}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isActive ? (
              <>
                <p className="truncate text-base font-semibold">{bestTitle}</p>
                <p className="mt-0.5 text-sm font-medium text-orange-600">
                  {es.streak.dayOf.replace('{current}', String(bestDay))}
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-muted-foreground">{es.home.habitsStreakZero}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{es.home.habitsStreakBest}</p>
              </>
            )}
          </div>

          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {totalCount > 0 && (
        <div className="border-t px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {displayedStreaks
                .filter((s) => s.habit.id !== bestEntry!.habit.id)
                .map((s) => {
                  const isDone = !!s.streak?.todayLog || s.streak?.streak.status === 'completed';
                  return (
                    <Flame
                      key={s.habit.id}
                      className={`h-4 w-4 transition-colors ${
                        isDone
                          ? 'text-orange-500 drop-shadow-[0_0_4px_rgba(251,146,60,0.5)]'
                          : 'text-muted-foreground/30'
                      }`}
                      strokeWidth={2.5}
                    />
                  );
                })}
            </div>
            {message && (
              <p className="ml-3 text-[10px] leading-tight text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      )}

      {totalCount === 0 && restartableCount > 0 && (
        <div className="border-t px-5 py-3">
          <p className="text-[10px] leading-tight text-muted-foreground">{message}</p>
        </div>
      )}
    </Link>
  );
}

export default function Home() {
  const [activities, setActivities] = useState<ActivityWithLog[]>([]);
  const [daily, setDaily] = useState<CategoryBreakdown[]>([]);
  const [scheduleStreak, setScheduleStreak] = useState<ScheduleStreak | null>(null);
  const [weeklyByDay, setWeeklyByDay] = useState<DayTotal[]>([]);
  const [habitsStreaks, setHabitsStreaks] = useState<StreakEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      api.get<ActivityWithLog[]>('/tasks', { params: { date: today } }),
      api.get<AnalyticsResponse>('/analytics', { params: { date: today } }),
      api.get<ScheduleStreak>('/analytics/schedule-streak'),
      api.get<{ streaks: StreakEntry[]; brokenStreaks: string[] }>('/streaks'),
    ])
      .then(([tasksRes, analyticsRes, streakRes, habitsRes]) => {
        setActivities(tasksRes.data);
        setDaily(analyticsRes.data.daily);
        setScheduleStreak(streakRes.data);
        setWeeklyByDay(analyticsRes.data.weeklyByDay);
        setHabitsStreaks(habitsRes.data.streaks);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">{es.common.loading}</p>;
  }

  return (
    <div className="space-y-6 page-fade-in">
      <NextActivityCard activities={activities} />

      <div className="grid gap-4 sm:grid-cols-2">
        <ScheduleStreakCard
          streak={scheduleStreak?.streak ?? 0}
          pendingStreak={scheduleStreak?.pendingStreak ?? 0}
          weeklyByDay={weeklyByDay}
        />
        <HabitsStreakCard streaks={habitsStreaks} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {es.home.dailyAnalysis}
        </h2>
        <CategoryProgressBars data={daily} />
      </div>
    </div>
  );
}
