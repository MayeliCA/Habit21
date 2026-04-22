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
  academic: { border: 'border-l-blue-500', icon: 'text-blue-500', dot: 'bg-blue-500' },
  vital: { border: 'border-l-green-500', icon: 'text-green-500', dot: 'bg-green-500' },
  personal: { border: 'border-l-purple-500', icon: 'text-purple-500', dot: 'bg-purple-500' },
  escape: { border: 'border-l-amber-500', icon: 'text-amber-500', dot: 'bg-amber-500' },
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
          <span className="shrink-0 whitespace-nowrap text-sm font-mono text-muted-foreground">
            {formatClockTime(item.time, settings.timeFormat)}{item.endTime ? `–${formatClockTime(item.endTime, settings.timeFormat)}` : ''}
          </span>

          <Icon className={`h-4 w-4 shrink-0 ${colors.icon}`} strokeWidth={1.5} />

          <span className="flex-1 text-sm font-medium">
            {item.activity}
          </span>

          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded p-1 text-muted-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-500" />
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
              className="rounded-full bg-red-500 px-6 text-white hover:bg-red-600"
            >
              {es.schedule.deleteActivity}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
