import { es } from '@/i18n/es';

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

interface DayTabsProps {
  active: number;
  onChange: (day: number) => void;
}

export function DayTabs({ active, onChange }: DayTabsProps) {
  return (
    <div className="flex justify-center gap-1 sm:gap-2">
      {DAY_ORDER.map((day) => {
        const isActive = day === active;
        const label = es.schedule.days[DAY_KEYS[day]];
        return (
          <button
            key={day}
            onClick={() => onChange(day)}
            className={
              'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors ' +
              (isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-input bg-background text-muted-foreground hover:text-foreground')
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
