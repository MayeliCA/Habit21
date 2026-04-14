import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStreaks } from '@/hooks/useStreak';
import { es } from '@/i18n/es';
import { StreakWidget } from '@/components/streaks/StreakWidget';
import type { HabitLog, StreakPreview } from '@shared/types/streak';

interface HabitItem {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
}

export default function Habits() {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const { streaks, startStreak, logDay, refetch } = useStreaks();
  const [title, setTitle] = useState('');

  useEffect(() => {
    api.get<HabitItem[]>('/habits').then((res) => setHabits(res.data));
  }, []);

  const createHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { data } = await api.post<HabitItem>('/habits', { title });
    setHabits((prev) => [data, ...prev]);
    setTitle('');
  };

  const handleStartStreak = async (habitId: string) => {
    await startStreak(habitId);
  };

  const handleLogToday = async (streakId: string) => {
    await logDay(streakId);
    refetch();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{es.habits.title}</h1>

      <form onSubmit={createHabit} className="flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">{es.habits.habitName}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {es.habits.addHabit}
        </button>
      </form>

      <div className="space-y-3">
        {habits.map((habit) => {
          const streakData = streaks.find((s) => s.habit.id === habit.id);
          return (
            <div key={habit.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{habit.title}</h3>
              </div>

              {streakData?.streak ? (
                <div className="mt-3">
                  <StreakWidget
                    streakPreview={streakData.streak}
                    onLogToday={() => handleLogToday(streakData.streak!.streak.id)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => handleStartStreak(habit.id)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  {es.streak.startStreak}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
