import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useStreaks } from '@/hooks/useStreak';
import { es } from '@/i18n/es';
import { StreakWidget } from '@/components/streaks/StreakWidget';
import { Trash2, Plus, AlertTriangle, Info, Crown, Rocket, RotateCcw, Flame, Mountain, Trophy } from 'lucide-react';
import type { Category } from '@shared/types/enums';
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

const MAX_HABITS = 6;

const CATEGORY_CONFIG: Record<Category, { color: string; bg: string; dot: string }> = {
  vital: { color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  academic: { color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  personal: { color: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-500' },
  escape: { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
};

const CATEGORIES: Category[] = ['vital', 'academic', 'personal'];

interface HabitItem {
  id: string;
  title: string;
  category: Category;
  description: string | null;
  isActive: boolean;
}

export default function Habits() {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const { streaks, isLoading: streaksLoading, startStreak, logDay, refetch } = useStreaks();
  const [habitsLoading, setHabitsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('vital');
  const [deleteTarget, setDeleteTarget] = useState<HabitItem | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<HabitItem[]>('/habits').then((res) => {
      setHabits(res.data);
      setHabitsLoading(false);
    });
  }, []);

  const createHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || habits.length >= MAX_HABITS) return;
    const { data } = await api.post<HabitItem>('/habits', {
      title,
      category: selectedCategory,
    });
    setHabits((prev) => [data, ...prev]);
    setTitle('');
    inputRef.current?.focus();
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

  const hasText = title.trim().length > 0;
  const isAtLimit = habits.length >= MAX_HABITS;
  const emptySlots = isAtLimit ? 0 : MAX_HABITS - habits.length;

  const creationBar = isAtLimit ? (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-2 text-center">
      <p className="text-xs text-amber-700">{es.habits.limitReached}</p>
    </div>
  ) : (
    <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
      {habits.length === 0 && (
        <h2 className="mb-2 text-xs font-bold text-primary">{es.habits.newVictory}</h2>
      )}
      <form onSubmit={createHabit}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={es.habits.habitName}
              className="w-full border-b border-input bg-transparent px-1 py-1.5 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${
                    isSelected
                      ? `${cfg.bg} ${cfg.color} ring-1 ring-current/20`
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {es.categoryShort[cat]}
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            disabled={!title.trim() || habits.length >= MAX_HABITS}
            className={`flex items-center justify-center gap-1 rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
              hasText
                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(30,41,59,0.2)] hover:bg-primary/90'
                : 'bg-primary/60 text-primary-foreground/60'
            }`}
          >
            <Plus className="h-3 w-3" />
            {es.habits.addHabit}
          </button>
        </div>
      </form>
    </div>
  );

  const isDataReady = !habitsLoading && !streaksLoading;

  if (!isDataReady) {
    return (
      <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-3 overflow-hidden page-fade-in">
        <div className="skeleton h-7 w-32 rounded-lg" />
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="grid flex-1 gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{es.habits.title}</h1>
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

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-primary">{es.habits.newVictory}</h2>
            <p className="text-xs text-muted-foreground">{es.habits.newVictorySubtitle}</p>
          </div>
          <form onSubmit={createHabit}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={es.habits.habitName}
                  className="w-full border-b border-input bg-transparent px-1 py-2 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORIES.map((cat) => {
                  const cfg = CATEGORY_CONFIG[cat];
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? `${cfg.bg} ${cfg.color} ring-1 ring-current/20`
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <span className={`inline-block h-2 w-2 rounded-full ${cfg.dot}`} />
                      {es.categoryShort[cat]}
                    </button>
                  );
                })}
              </div>
              <button
                type="submit"
                disabled={!title.trim()}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                  hasText
                    ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(30,41,59,0.2)] hover:bg-primary/90'
                    : 'bg-primary/60 text-primary-foreground/60'
                }`}
              >
                <Plus className="h-4 w-4" />
                {es.habits.addHabit}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
          <div className="rotate-[-15deg]">
            <Rocket className="h-20 w-20 text-slate-200" strokeWidth={1} />
          </div>
          <div className="max-w-sm text-center space-y-2">
            <h2 className="text-lg font-semibold text-[#1e293b]">{es.habits.emptyTitle}</h2>
            <p className="text-sm text-gray-400">{es.habits.emptySubtitle}</p>
          </div>
          <button
            onClick={() => inputRef.current?.focus()}
            className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(30,41,59,0.2)] transition-colors hover:bg-primary/90"
          >
            {es.habits.emptyCta}
          </button>
          <p className="text-xs text-gray-300">{es.habits.emptyTip}</p>
        </div>
      </div>
    );
  }

  const totalCount = habits.length + emptySlots;

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-3 overflow-hidden page-fade-in">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">{es.habits.title}</h1>
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

      {creationBar}

      <div className="grid flex-1 gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" style={{ gridAutoRows: `minmax(0, calc((100% - 1rem) / ${Math.ceil(totalCount / 3)}))` }}>
        {habits.map((habit) => {
          const streakData = streaks.find((s) => s.habit.id === habit.id);
          const hasActiveStreak = streakData?.streak;
          const catCfg = CATEGORY_CONFIG[habit.category] ?? CATEGORY_CONFIG.vital;
          const isLit = hasActiveStreak && (hasActiveStreak.todayLog || hasActiveStreak.streak.status === 'completed');

          return (
            <div
              key={habit.id}
              className={`group flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow ${isLit ? 'shadow-md' : 'hover:shadow-md'}`}
            >
              <div className={`h-1 w-full shrink-0 ${catCfg.dot}`} />

              <div className="shrink-0 px-3 pt-2.5 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 flex-1 text-base font-semibold tracking-tight leading-tight text-[#1e293b]">
                    {habit.title}
                    {streakData?.streak?.streak.status === 'completed' && (
                      <Crown className="ml-0.5 inline h-3.5 w-3.5 shrink-0 text-amber-500" />
                    )}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1 pt-0.5">
                    <span className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${catCfg.bg} ${catCfg.color} border-current/10`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${catCfg.dot}`} />
                      {es.categoryShort[habit.category]}
                    </span>
                    <button
                      onClick={() => setDeleteTarget(habit)}
                      className="rounded p-0.5 text-transparent group-hover:text-slate-300 transition-colors hover:!bg-red-50 hover:!text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {hasActiveStreak ? (
                <StreakWidget
                  streakPreview={hasActiveStreak}
                  onLogToday={() => handleLogToday(hasActiveStreak.streak.id)}
                />
              ) : streakData?.recentlyFailed ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-1 fade-in-up">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 drop-shadow-sm">
                    <Flame className="h-5 w-5 text-gray-300" strokeWidth={2} />
                  </div>
                  <p className="text-center text-[10px] text-gray-500">
                    {es.streak.motivationalRestart}
                  </p>
                  <button
                    onClick={() => handleStartStreak(habit.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    {es.streak.restartStreak}
                  </button>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 drop-shadow-sm">
                    <Flame className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {es.streak.firstVictory}
                  </p>
                  <button
                    onClick={() => handleStartStreak(habit.id)}
                    className="pulse-soft rounded-lg bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
                  >
                    {es.streak.startStreak}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30"
          >
            <span className="text-xs font-semibold text-gray-300">{es.habits.emptySlot}</span>
          </div>
        ))}
      </div>

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
