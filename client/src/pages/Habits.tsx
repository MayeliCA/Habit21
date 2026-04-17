import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useStreaks } from '@/hooks/useStreak';
import { es } from '@/i18n/es';
import { StreakWidget } from '@/components/streaks/StreakWidget';
import { Trash2, Plus, AlertTriangle, Info, Crown, Rocket } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

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
  const [deleteTarget, setDeleteTarget] = useState<HabitItem | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/habits/${deleteTarget.id}`);
    setHabits((prev) => prev.filter((h) => h.id !== deleteTarget.id));
    setDeleteTarget(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{es.habits.title}</h1>
        <Popover open={infoOpen} onOpenChange={setInfoOpen}>
          <PopoverTrigger asChild>
            <button className={`rounded-full p-1 transition-colors hover:bg-muted ${infoOpen ? 'text-primary' : 'text-muted-foreground/60'}`}>
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 space-y-3">
            <p className="text-sm leading-relaxed">{es.streak.infoFire}</p>
            <p className="text-sm leading-relaxed">{es.streak.infoReset}</p>
            <p className="text-sm leading-relaxed">{es.streak.infoStreak}</p>
          </PopoverContent>
        </Popover>
      </div>

      <form onSubmit={createHabit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={es.habits.habitName}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {es.habits.addHabit}
        </button>
      </form>

      {habits.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-slate-50/50 px-8 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center text-gray-200 float-slow">
            <Rocket className="h-12 w-12" strokeWidth={1.5} />
          </div>
          <h2 className="mx-auto max-w-sm text-lg font-bold text-primary">
            {es.habits.emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {es.habits.emptySubtitle}
          </p>
          <button
            onClick={() => inputRef.current?.focus()}
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {es.habits.emptyCta}
          </button>
          <p className="mt-4 text-xs italic text-muted-foreground/70">
            {es.habits.emptyTip}
          </p>
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const streakData = streaks.find((s) => s.habit.id === habit.id);
          const hasActiveStreak = streakData?.streak;

          return (
            <div
              key={habit.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between bg-slate-50/80 px-4 py-3">
                <div className="flex items-center gap-1.5 flex-1 justify-center">
                  <h3 className="text-sm font-bold leading-tight text-center">{habit.title}</h3>
                  {streakData?.streak?.streak.status === 'completed' && (
                    <Crown className="h-4 w-4 shrink-0 text-amber-500" />
                  )}
                </div>
                <button
                  onClick={() => setDeleteTarget(habit)}
                  className="-mt-0.5 -mr-1 shrink-0 rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {hasActiveStreak ? (
                <StreakWidget
                  streakPreview={hasActiveStreak}
                  onLogToday={() => handleLogToday(hasActiveStreak.streak.id)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 pb-4 pt-3">
                  <button
                    onClick={() => handleStartStreak(habit.id)}
                    className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {es.streak.startStreak}
                  </button>
                </div>
              )}
            </div>
          );
        })}
       </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <AlertDialogTitle>{es.habits.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{es.habits.deleteConfirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{es.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-red-500 px-6 text-white hover:bg-red-600"
            >
              {es.habits.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
