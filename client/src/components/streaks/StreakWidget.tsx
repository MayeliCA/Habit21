import { useState, useEffect, useRef } from 'react';
import { Flame, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { StreakPreview } from '@shared/types/streak';
import { es } from '@/i18n/es';

interface StreakWidgetProps {
  streakPreview: StreakPreview;
  onLogToday: () => void;
}

export function StreakWidget({ streakPreview, onLogToday }: StreakWidgetProps) {
  const { streak, todayLog } = streakPreview;
  const progress = Math.min((streak.currentDay / 21) * 100, 100);
  const canLogToday = streak.status === 'active' && !todayLog;
  const isActive = !!todayLog || streak.status === 'completed';
  const isCompleted = streak.status === 'completed';
  const [showSparks, setShowSparks] = useState(false);
  const [igniting, setIgniting] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isCompleted && !celebrated) {
      setCelebrated(true);
      const rect = btnRef.current?.getBoundingClientRect();
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
  }, [isCompleted, celebrated]);

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
    <div className="flex flex-col items-center gap-3 px-4 pb-4 pt-1">
      {isCompleted ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          <Crown className="h-3.5 w-3.5" />
          {es.streak.mastered}
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {es.streak.dayOf.replace('{current}', String(streak.currentDay))}
        </span>
      )}

      <div className="relative">
        <button
          ref={btnRef}
          onClick={handleClick}
          disabled={!canLogToday}
          className={`group/fire relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
            isActive
              ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg fire-glow'
              : canLogToday
                ? 'cursor-pointer bg-gray-100 hover:bg-amber-50 hover:shadow-[0_0_16px_rgba(251,146,60,0.35)]'
                : 'bg-gray-100'
          } ${igniting ? 'fire-ignite' : ''}`}
        >
          <Flame
            className={`h-8 w-8 transition-colors duration-300 ${
              isActive
                ? 'text-white'
                : canLogToday
                  ? 'text-gray-300 group-hover/fire:text-amber-500'
                  : 'text-gray-300'
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
      </div>

      {canLogToday && (
        <span className="text-xs text-muted-foreground">{es.streak.lightUp}</span>
      )}
      {isActive && !isCompleted && (
        <span className="text-xs font-semibold text-orange-500">{es.streak.lit}</span>
      )}
      {isCompleted && (
        <span className="text-xs font-semibold text-green-600">{es.streak.completed}</span>
      )}

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
