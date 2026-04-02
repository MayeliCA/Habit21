import type { ActivityWithLog } from '@shared/types/schedule';
import type { Category } from '@shared/types/enums';
import { es } from '@/i18n/es';

const CATEGORY_COLORS: Record<Category, string> = {
  academic: 'bg-blue-100 text-blue-800',
  vital: 'bg-green-100 text-green-800',
  personal: 'bg-purple-100 text-purple-800',
  escape: 'bg-amber-100 text-amber-800',
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

interface ActivityRowProps {
  item: ActivityWithLog;
  onDelete: (id: string) => void;
}

export function ActivityRow({ item, onDelete }: ActivityRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
      <span className="whitespace-nowrap text-sm font-mono text-muted-foreground">
        {item.time}{item.endTime ? ` - ${item.endTime}` : ''}
      </span>
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[item.category]}`}>
        {es.category[item.category]}
      </span>
      <div className="flex gap-0.5">
        {DAY_ORDER.map((day) => {
          const active = item.daysOfWeek.includes(day);
          return (
            <span
              key={day}
              className={
                'text-[10px] leading-none ' +
                (active ? 'font-semibold text-foreground' : 'text-muted-foreground/40')
              }
            >
              {es.schedule.days[DAY_KEYS[day]]}
            </span>
          );
        })}
      </div>
      <span className="flex-1 text-sm">
        {item.activity}
      </span>
      <button
        onClick={() => onDelete(item.id)}
        className="text-xs text-red-500 hover:text-red-700"
      >
        ✕
      </button>
    </div>
  );
}
