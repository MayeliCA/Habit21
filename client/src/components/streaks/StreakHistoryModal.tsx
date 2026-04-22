import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import { StreakKPIs } from './StreakKPIs';
import { StreakTimeline } from './StreakTimeline';
import { StreakProgressChart } from './StreakProgressChart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { StreakHistory } from '@shared/types/streak';

interface StreakHistoryModalProps {
  habitId: string;
  habitTitle: string;
  open: boolean;
  onClose: () => void;
}

export function StreakHistoryModal({ habitId, habitTitle, open, onClose }: StreakHistoryModalProps) {
  const [history, setHistory] = useState<StreakHistory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get<StreakHistory>(`/streaks/habit/${habitId}/history`)
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false));
  }, [open, habitId]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-5 gap-4">
        <DialogHeader className="space-y-0 pb-0">
          <DialogTitle className="text-lg">{es.streakHistory.title}</DialogTitle>
          <DialogDescription className="text-sm">{habitTitle}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-muted-foreground">{es.common.loading}</p>
          </div>
        ) : !history || history.totalAttempts === 0 ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-muted-foreground">{es.streakHistory.noHistory}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <StreakKPIs history={history} />
            <StreakTimeline attempts={history.attempts} bestStreak={history.bestStreak} />
            <StreakProgressChart attempts={history.attempts} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
