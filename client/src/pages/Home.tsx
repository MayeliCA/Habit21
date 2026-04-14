import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { BalancePieChart } from '@/components/dashboard/BalancePieChart';
import type { ActivityWithLog } from '@shared/types/schedule';
import type { AnalyticsResponse, CategoryBreakdown } from '@shared/types/analytics';
import type { ScheduleStreak } from '@shared/types/analytics';
import type { StreakPreview } from '@shared/types/streak';
import type { Category } from '@shared/types/enums';
import { ArrowRight, Flame, Star } from 'lucide-react';

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
                  {next.time}{next.endTime ? ` - ${next.endTime}` : ''}
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

function StreakCard({
  to,
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <Icon className="h-6 w-6 shrink-0 text-amber-500" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export default function Home() {
  const [activities, setActivities] = useState<ActivityWithLog[]>([]);
  const [daily, setDaily] = useState<CategoryBreakdown[]>([]);
  const [scheduleStreak, setScheduleStreak] = useState<ScheduleStreak | null>(null);
  const [habitsStreak, setHabitsStreak] = useState<{ maxDay: number; habitTitle: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      api.get<ActivityWithLog[]>('/tasks', { params: { date: today } }),
      api.get<AnalyticsResponse>('/analytics', { params: { date: today } }),
      api.get<ScheduleStreak>('/analytics/schedule-streak'),
      api.get<{ habit: { id: string; title: string }; streak: StreakPreview | null }[]>('/streaks'),
    ])
      .then(([tasksRes, analyticsRes, streakRes, habitsRes]) => {
        setActivities(tasksRes.data);
        setDaily(analyticsRes.data.daily);
        setScheduleStreak(streakRes.data);

        const activeHabits = habitsRes.data.filter((h) => h.streak?.streak.status === 'active');
        if (activeHabits.length > 0) {
          const best = activeHabits.reduce((a, b) =>
            (a.streak?.streak.currentDay ?? 0) > (b.streak?.streak.currentDay ?? 0) ? a : b
          );
          setHabitsStreak({
            maxDay: best.streak?.streak.currentDay ?? 0,
            habitTitle: best.habit.title,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">{es.common.loading}</p>;
  }

  const scheduleStreakValue = scheduleStreak && scheduleStreak.streak > 0
    ? es.home.scheduleStreakDays.replace('{count}', String(scheduleStreak.streak))
    : es.home.scheduleStreakZero;

  const habitsStreakValue = habitsStreak && habitsStreak.maxDay > 0
    ? es.home.habitsStreakDays.replace('{day}', String(habitsStreak.maxDay))
    : es.home.habitsStreakZero;

  return (
    <div className="space-y-6">
      <NextActivityCard activities={activities} />

      <div className="grid gap-4 sm:grid-cols-2">
        <StreakCard
          to="/panel"
          icon={Star}
          label={es.home.scheduleStreak}
          value={scheduleStreakValue}
          subtitle=""
        />
        <StreakCard
          to="/habits"
          icon={Flame}
          label={es.home.habitsStreak}
          value={habitsStreakValue}
          subtitle=""
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {es.home.dailyAnalysis}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <CategoryChart
            data={daily}
            title={es.home.planVsReal}
            compact
          />
          <BalancePieChart
            data={daily}
            title={es.home.distribution}
            compact
          />
        </div>
      </div>
    </div>
  );
}
