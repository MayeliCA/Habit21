import { useState } from 'react';
import { Trash2, BookOpen, Heart, Coffee, Gamepad2, AlertTriangle } from 'lucide-react';
import type { ActivityWithLog } from '@shared/types/schedule';
import type { Category } from '@shared/types/enums';
import { es } from '@/i18n/es';
import { useSettings } from '@/hooks/useSettings';
import { formatClockTime } from '@/lib/format';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CATEGORY_COLORS: Record<Category, { border: string; icon: string; dot: string }> = {
  academic: { border: 'border-l-academic', icon: 'text-academic', dot: 'bg-academic' },
  vital: { border: 'border-l-vital', icon: 'text-vital', dot: 'bg-vital' },
  personal: { border: 'border-l-personal', icon: 'text-personal', dot: 'bg-personal' },
  escape: { border: 'border-l-escape', icon: 'text-escape', dot: 'bg-escape' },
};

const CATEGORY_ICON: Record<Category, React.ElementType> = {
  academic: BookOpen,
  vital: Heart,
  personal: Coffee,
  escape: Gamepad2,
};

interface ActivityRowProps {
  item: ActivityWithLog;
  onDelete: (id: string) => void;
}

export function ActivityRow({ item, onDelete }: ActivityRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const Icon = CATEGORY_ICON[item.category] ?? BookOpen;
  const colors = CATEGORY_COLORS[item.category];
  const { settings } = useSettings();

  return (
    <>
      <div className="flex items-center">
        <div className="relative z-10 -ml-3 flex shrink-0 items-center justify-center">
          <div className="h-3.5 w-3.5 rounded-full border-2 border-card bg-muted-foreground/40 shadow-sm" />
          <div className={`absolute h-2 w-2 rounded-full ${colors.dot}`} />
        </div>

        <div className={`ml-3 flex flex-1 items-center gap-3 rounded-xl border border-l-[3px] bg-card py-3 pr-4 pl-4 shadow-sm transition-shadow hover:shadow-md ${colors.border}`}>
          <span className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-mono text-muted-foreground">
            {formatClockTime(item.time, settings.timeFormat)}{item.endTime ? `–${formatClockTime(item.endTime, settings.timeFormat)}` : ''}
          </span>

          <Icon className={`h-4 w-4 shrink-0 ${colors.icon}`} strokeWidth={1.5} />

          <span className="flex-1 text-sm font-medium">
            {item.activity}
          </span>

          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded p-1 text-muted-foreground/40 transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <AlertTriangle className="h-6 w-6 text-danger" />
            </div>
            <AlertDialogTitle>{es.schedule.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {es.schedule.confirmDeleteDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{es.schedule.cancelDelete}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(item.id)}
              className="rounded-full bg-danger px-6 text-white hover:bg-danger/90"
            >
              {es.schedule.deleteActivity}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
