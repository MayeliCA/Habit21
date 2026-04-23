import { useState } from 'react';
import type { ActivityWithLog } from '@shared/types/schedule';
import type { Category } from '@shared/types/enums';
import { useSettings } from '@/hooks/useSettings';
import { formatClockTime } from '@/lib/format';
import { es } from '@/i18n/es';

const RANGE_START = 5;
const RANGE_END = 23;
const RANGE_HOURS = RANGE_END - RANGE_START;

const CATEGORY_COLORS: Record<Category, { bg: string; hover: string }> = {
  academic: { bg: 'bg-blue-500', hover: 'hover:bg-blue-400' },
  vital: { bg: 'bg-green-500', hover: 'hover:bg-green-400' },
  personal: { bg: 'bg-purple-500', hover: 'hover:bg-purple-400' },
  escape: { bg: 'bg-amber-500', hover: 'hover:bg-amber-400' },
};

const HOUR_MARKS = [5, 8, 11, 14, 17, 20, 23];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToPercent(minutes: number): number {
  const rangeStartMin = RANGE_START * 60;
  const rangeEndMin = RANGE_END * 60;
  const clamped = Math.max(rangeStartMin, Math.min(rangeEndMin, minutes));
  return ((clamped - rangeStartMin) / (rangeEndMin - rangeStartMin)) * 100;
}

interface Block {
  id: string;
  left: number;
  width: number;
  category: Category;
  activity: string;
  timeStr: string;
}

interface TimelineBarProps {
  activities: ActivityWithLog[];
}

export function TimelineBar({ activities }: TimelineBarProps) {
  const { settings } = useSettings();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const blocks: Block[] = activities.map((a) => {
    const startMin = timeToMinutes(a.time);
    const endMin = a.endTime ? timeToMinutes(a.endTime) : startMin + 45;
    const left = minutesToPercent(startMin);
    const right = minutesToPercent(endMin);
    const width = Math.max(right - left, 3.5);

    const startFormatted = formatClockTime(a.time, settings.timeFormat);
    const endFormatted = a.endTime ? `–${formatClockTime(a.endTime, settings.timeFormat)}` : '';

    return {
      id: a.id,
      left,
      width,
      category: a.category,
      activity: a.activity,
      timeStr: `${startFormatted}${endFormatted}`,
    };
  });

  return (
    <div className="space-y-1.5">
      <div className="relative h-5 w-full">
        <div className="absolute inset-x-0 top-0 h-2 rounded-full bg-border" />

        {blocks.map((block) => {
          const colors = CATEGORY_COLORS[block.category];
          const isHovered = hoveredId === block.id;
          return (
            <div
              key={block.id}
              className={`absolute top-0 h-2 rounded-full transition-all ${colors.bg} ${colors.hover} cursor-pointer`}
              style={{ left: `${block.left}%`, width: `${block.width}%`, zIndex: isHovered ? 20 : 1 }}
              onMouseEnter={() => setHoveredId(block.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          );
        })}

        <div className="absolute inset-x-0 top-0 h-2">
          {HOUR_MARKS.map((h) => {
            const pct = ((h - RANGE_START) / RANGE_HOURS) * 100;
            return (
              <div
                key={h}
                className="absolute top-full"
                style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
              >
                <span className="text-[9px] leading-none text-muted-foreground/60">
                  {String(h).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {hoveredId && (() => {
        const block = blocks.find((b) => b.id === hoveredId);
        if (!block) return null;
        return (
          <div className="flex items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
            <span className={`inline-block h-2 w-2 rounded-full ${CATEGORY_COLORS[block.category].bg}`} />
            <span className="font-medium text-foreground">{block.activity}</span>
            <span>{block.timeStr}</span>
          </div>
        );
      })()}
    </div>
  );
}
