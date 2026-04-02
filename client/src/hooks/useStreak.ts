import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { StreakPreview } from '@shared/types/streak';

interface StreakData {
  habit: { id: string; title: string; failureMode: string };
  streak: StreakPreview | null;
}

export function useStreaks() {
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStreaks = useCallback(async () => {
    try {
      const { data } = await api.get<StreakData[]>('/streaks');
      setStreaks(data);
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

  return { streaks, isLoading, refetch: fetchStreaks, startStreak };
}
