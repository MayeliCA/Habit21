import { useState } from 'react';
import type { Category } from '@shared/types/enums';
import { es } from '@/i18n/es';
import { useSettings } from '@/hooks/useSettings';

const CATEGORY_OPTIONS: Category[] = ['academic', 'vital', 'personal', 'escape'];

const CATEGORY_CONFIG: Record<Category, { color: string; bg: string; dot: string }> = {
  vital: { color: 'text-vital-dark', bg: 'bg-vital-light', dot: 'bg-vital' },
  academic: { color: 'text-academic-dark', bg: 'bg-academic-light', dot: 'bg-academic' },
  personal: { color: 'text-personal-dark', bg: 'bg-personal-light', dot: 'bg-personal' },
  escape: { color: 'text-escape-dark', bg: 'bg-escape-light', dot: 'bg-escape' },
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

function to24h(hour: number, minute: number, period: 'AM' | 'PM'): string {
  let h = hour;
  if (period === 'AM' && h === 12) h = 0;
  else if (period === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

interface TimeInput12hProps {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
  onChangeHour: (h: number) => void;
  onChangeMinute: (m: number) => void;
  onChangePeriod: (p: 'AM' | 'PM') => void;
  disabled?: boolean;
}

function TimeInput12h({ hour, minute, period, onChangeHour, onChangeMinute, onChangePeriod, disabled }: TimeInput12hProps) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={1}
        max={12}
        value={hour || ''}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= 1 && v <= 12) onChangeHour(v);
        }}
        disabled={disabled}
        className="w-12 rounded-md border border-input bg-background px-2 py-1.5 text-center text-sm"
      />
      <span className="text-sm text-muted-foreground">:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={minute !== 0 ? minute : ''}
        placeholder="00"
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= 0 && v <= 59) onChangeMinute(v);
          else if (e.target.value === '') onChangeMinute(0);
        }}
        disabled={disabled}
        className="w-12 rounded-md border border-input bg-background px-2 py-1.5 text-center text-sm"
      />
      <div className="flex rounded-md border border-input overflow-hidden">
        <button
          type="button"
          onClick={() => onChangePeriod('AM')}
          disabled={disabled}
          className={`px-2 py-1.5 text-xs font-medium transition-colors ${
            period === 'AM'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          {es.schedule.am}
        </button>
        <button
          type="button"
          onClick={() => onChangePeriod('PM')}
          disabled={disabled}
          className={`px-2 py-1.5 text-xs font-medium transition-colors ${
            period === 'PM'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          {es.schedule.pm}
        </button>
      </div>
    </div>
  );
}

interface AddActivityFormProps {
  disabled: boolean;
  onSubmit: (daysOfWeek: number[], time: string, endTime: string, category: Category, activity: string) => Promise<boolean>;
}

export function AddActivityForm({ disabled, onSubmit }: AddActivityFormProps) {
  const { settings } = useSettings();
  const is12h = settings.timeFormat === '12h';

  const [startTime24, setStartTime24] = useState('');
  const [endTime24, setEndTime24] = useState('');
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState(9);
  const [endMinute, setEndMinute] = useState(0);
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [category, setCategory] = useState<Category>('academic');
  const [activity, setActivity] = useState('');

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const getStartTime = () => (is12h ? to24h(startHour, startMinute, startPeriod) : startTime24);
  const getEndTime = () => (is12h ? to24h(endHour, endMinute, endPeriod) : endTime24);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = getStartTime();
    const et = getEndTime();
    if (!st || !et || !activity.trim() || daysOfWeek.length === 0) return;
    if (st >= et) return;
    const ok = await onSubmit(daysOfWeek, st, et, category, activity.trim());
    if (!ok) return;
    setStartTime24('');
    setEndTime24('');
    setStartHour(8);
    setStartMinute(0);
    setStartPeriod('AM');
    setEndHour(9);
    setEndMinute(0);
    setEndPeriod('AM');
    setDaysOfWeek([]);
    setCategory('academic');
    setActivity('');
  };

  const canSubmit = () => {
    const st = getStartTime();
    const et = getEndTime();
    return st && et && activity.trim() && st < et && daysOfWeek.length > 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {es.schedule.selectDays}
        </label>
        <div className="flex gap-1 sm:gap-2">
          {DAY_ORDER.map((day) => {
            const active = daysOfWeek.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={
                  'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ' +
                  (active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-muted text-muted-foreground hover:border-border hover:bg-accent')
                }
              >
                {es.schedule.days[DAY_KEYS[day]]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-end md:gap-2">
        {is12h ? (
          <>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {es.schedule.startTime}
              </label>
              <TimeInput12h
                hour={startHour}
                minute={startMinute}
                period={startPeriod}
                onChangeHour={setStartHour}
                onChangeMinute={setStartMinute}
                onChangePeriod={setStartPeriod}
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {es.schedule.endTime}
              </label>
              <TimeInput12h
                hour={endHour}
                minute={endMinute}
                period={endPeriod}
                onChangeHour={setEndHour}
                onChangeMinute={setEndMinute}
                onChangePeriod={setEndPeriod}
                disabled={disabled}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {es.schedule.startTime}
              </label>
              <input
                type="time"
                value={startTime24}
                onChange={(e) => setStartTime24(e.target.value)}
                disabled={disabled}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {es.schedule.endTime}
              </label>
              <input
                type="time"
                value={endTime24}
                onChange={(e) => setEndTime24(e.target.value)}
                disabled={disabled}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </>
        )}
        <div className="col-span-2 space-y-1 md:col-span-1">
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
        <div className="col-span-2 md:col-span-1 min-w-0 md:min-w-[7.5rem] sm:md:min-w-[11.25rem] md:flex-1 space-y-1">
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
        <div className="col-span-2 md:col-span-1 flex md:block">
          <button
            type="submit"
            disabled={disabled || !canSubmit()}
            className="w-full rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_12px_rgba(30,41,59,0.15)] hover:bg-primary/90 disabled:opacity-50"
          >
            {es.schedule.addActivity}
          </button>
        </div>
      </div>
    </form>
  );
}
