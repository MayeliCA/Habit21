import { useState } from 'react';
import type { Category } from '@shared/types/enums';
import { es } from '@/i18n/es';

const CATEGORY_OPTIONS: Category[] = ['academic', 'vital', 'personal', 'escape'];

const CATEGORY_CONFIG: Record<Category, { color: string; bg: string; dot: string }> = {
  vital: { color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  academic: { color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  personal: { color: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-500' },
  escape: { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
};
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_KEYS: Record<number, keyof typeof es.schedule.days> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

interface AddActivityFormProps {
  disabled: boolean;
  onSubmit: (daysOfWeek: number[], time: string, endTime: string, category: Category, activity: string) => void;
}

export function AddActivityForm({ disabled, onSubmit }: AddActivityFormProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [category, setCategory] = useState<Category>('academic');
  const [activity, setActivity] = useState('');

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || !activity.trim() || daysOfWeek.length === 0) return;
    if (startTime >= endTime) return;
    onSubmit(daysOfWeek, startTime, endTime, category, activity.trim());
    setStartTime('');
    setEndTime('');
    setDaysOfWeek([]);
    setCategory('academic');
    setActivity('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {es.schedule.selectDays}
        </label>
        <div className="flex gap-2">
          {DAY_ORDER.map((day) => {
            const active = daysOfWeek.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ' +
                  (active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-slate-200 bg-slate-50 text-muted-foreground hover:border-slate-300 hover:bg-slate-100')
                }
              >
                {es.schedule.days[DAY_KEYS[day]]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {es.schedule.startTime}
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={disabled}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {es.schedule.endTime}
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={disabled}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {es.schedule.category}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_OPTIONS.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
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
        </div>
        <div className="min-w-[180px] flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {es.schedule.activity}
          </label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder={es.schedule.addActivity}
            disabled={disabled}
            maxLength={200}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !startTime || !endTime || !activity.trim() || startTime >= endTime || daysOfWeek.length === 0}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_12px_rgba(30,41,59,0.15)] hover:bg-primary/90 disabled:opacity-50"
        >
          {es.schedule.addActivity}
        </button>
      </div>
    </form>
  );
}
