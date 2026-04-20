import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import type { StreakPreview } from '@shared/types/streak';

interface StreakData {
  habit: { id: string; title: string };
  streak: StreakPreview | null;
  recentlyFailed: boolean;
}

interface StreaksResponse {
  streaks: StreakData[];
  brokenStreaks: string[];
}

export function useStreaks() {
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStreaks = useCallback(async () => {
    try {
      const { data } = await api.get<StreaksResponse>('/streaks');
      setStreaks(data.streaks);

      if (data.brokenStreaks.length > 0) {
        const habitNames = data.brokenStreaks.join(', ');
        toast.error(
          es.streak.streakLostHabits.replace('{habits}', habitNames),
          { description: es.streak.streakLost, duration: 6000 },
        );
      }
    } catch (err) {
      console.error('Failed to fetch streaks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreaks();
  }, [fetchStreaks]);

  const startStreak = useCallback(async (habitId: string) => {
    const { data } = await api.post(`/streaks/habit/${habitId}/start`);
    await fetchStreaks();
    return data;
  }, [fetchStreaks]);

  const logDay = useCallback(async (streakId: string) => {
    const { data } = await api.post(`/streaks/${streakId}/log`);
    await fetchStreaks();
    return data;
  }, [fetchStreaks]);

  return { streaks, isLoading, refetch: fetchStreaks, startStreak, logDay };
}
