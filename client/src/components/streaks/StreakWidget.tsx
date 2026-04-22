import { useState, useEffect, useRef } from 'react';
import { Flame, Crown, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { StreakPreview } from '@shared/types/streak';
import { es } from '@/i18n/es';
import { useSettings } from '@/hooks/useSettings';

const MILESTONES = new Set([7, 14, 21]);

function isMilestone(day: number): boolean {
  return MILESTONES.has(day);
}

function fireCelebration(ref: React.RefObject<HTMLButtonElement | null>) {
  const rect = ref.current?.getBoundingClientRect();
  const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
  const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x, y },
    colors: ['#fbbf24', '#f59e0b', '#ef4444', '#3b82f6', '#22c55e'],
  });
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
    });
  }, 250);
}

interface StreakWidgetProps {
  streakPreview: StreakPreview;
  onLogToday: () => void;
}

export function StreakWidget({ streakPreview, onLogToday }: StreakWidgetProps) {
  const { streak, todayLog } = streakPreview;
  const { settings } = useSettings();
  const progress = Math.min((streak.currentDay / 21) * 100, 100);
  const canLogToday = streak.status === 'active' && !todayLog;
  const isActive = !!todayLog || streak.status === 'completed';
  const isCompleted = streak.status === 'completed';
  const [showSparks, setShowSparks] = useState(false);
  const [igniting, setIgniting] = useState(false);
  const [celebratedDays, setCelebratedDays] = useState<Set<number>>(new Set());
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!settings.celebrationsEnabled) return;
    const day = streak.currentDay;
    if (isMilestone(day) && isActive && !celebratedDays.has(day)) {
      setCelebratedDays((prev) => new Set(prev).add(day));
      fireCelebration(btnRef);
    }
  }, [streak.currentDay, isActive, celebratedDays, settings.celebrationsEnabled]);

  const barColor = isCompleted
    ? 'bg-green-500'
    : streak.status === 'failed'
      ? 'bg-red-500'
      : 'bg-primary';

  const handleClick = () => {
    if (!canLogToday) return;
    setIgniting(true);
    setShowSparks(true);
    setTimeout(() => setIgniting(false), 400);
    setTimeout(() => setShowSparks(false), 700);
    onLogToday();
  };

  return (
    <div className="flex flex-1 flex-col justify-between px-3">
      <div className="flex justify-center pt-1">
        {isCompleted ? (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
            <Crown className="h-3 w-3" />
            {es.streak.mastered}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-medium text-primary">
            {es.streak.dayOf.replace('{current}', String(streak.currentDay))}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <button
          ref={btnRef}
          onClick={handleClick}
          disabled={!canLogToday}
          className={`group/fire relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
            isActive
              ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-md fire-glow drop-shadow-[0_0_10px_rgba(251,146,60,0.45)]'
              : canLogToday
                ? 'cursor-pointer bg-muted drop-shadow-[0_0_6px_rgba(0,0,0,0.06)] hover:bg-amber-500/10 hover:shadow-[0_0_18px_rgba(251,146,60,0.35)]'
                : 'bg-muted'
          } ${igniting ? 'fire-ignite' : ''}`}
        >
          <Flame
            className={`h-7 w-7 transition-colors duration-300 ${
              isActive
                ? 'text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]'
                : canLogToday
                  ? 'text-muted-foreground/40 group-hover/fire:text-amber-500'
                  : 'text-muted-foreground/40'
            }`}
            strokeWidth={2.5}
          />
          {showSparks && (
            <div className="spark-container absolute inset-0 flex items-center justify-center">
              <span className="spark-1 absolute h-2 w-2 rounded-full bg-orange-400" />
              <span className="spark-2 absolute h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <span className="spark-3 absolute h-1.5 w-1.5 rounded-full bg-amber-500" />
            </div>
          )}
        </button>
        {canLogToday && (
          <span className="text-[10px] text-muted-foreground">{es.streak.lightUp}</span>
        )}
        {isActive && !isCompleted && (
          <span className="text-[10px] font-medium text-orange-500">{es.streak.lit}</span>
        )}
        {isCompleted && (
          <span className="text-[10px] font-medium text-green-600">{es.streak.completed}</span>
        )}
      </div>

      <div className="flex w-full items-center gap-1 pb-3 pt-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <Trophy className={`h-3 w-3 shrink-0 ${isCompleted ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : 'text-muted-foreground/30 opacity-50'}`} />
      </div>
    </div>
  );
}
