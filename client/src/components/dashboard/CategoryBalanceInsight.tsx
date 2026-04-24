import { BookOpen, Heart, Coffee, Gamepad2 } from 'lucide-react';
import { es } from '@/i18n/es';
import type { Category } from '@shared/types/enums';

type BalanceStatus = 'green' | 'amber' | 'red';

const STATUS_STYLES: Record<BalanceStatus, { dot: string; text: string }> = {
  green: { dot: 'bg-success', text: 'text-success-dark' },
  amber: { dot: 'bg-warning', text: 'text-warning-dark' },
  red: { dot: 'bg-danger', text: 'text-danger' },
};

const CATEGORY_CONFIG: Record<Category, { icon: React.ElementType; label: string }> = {
  academic: { icon: BookOpen, label: es.categoryShort.academic },
  vital: { icon: Heart, label: es.categoryShort.vital },
  personal: { icon: Coffee, label: es.categoryShort.personal },
  escape: { icon: Gamepad2, label: es.categoryShort.escape },
};

const CATEGORY_ORDER: Category[] = ['academic', 'vital', 'personal', 'escape'];

const OK_MESSAGES: Record<Category, string> = {
  academic: es.dashboard.balanceAcademicOk,
  vital: es.dashboard.balanceVitalOk,
  personal: es.dashboard.balancePersonalOk,
  escape: es.dashboard.balanceEscapeOk,
};

function getStatus(category: Category, minutes: number): BalanceStatus {
  switch (category) {
    case 'academic':
      if (minutes >= 240 && minutes <= 360) return 'green';
      if ((minutes >= 120 && minutes < 240) || (minutes > 360 && minutes <= 480)) return 'amber';
      return 'red';
    case 'vital':
    case 'personal':
      if (minutes >= 60) return 'green';
      if (minutes >= 30) return 'amber';
      return 'red';
    case 'escape':
      if (minutes <= 180) return 'green';
      if (minutes <= 300) return 'amber';
      return 'red';
  }
}

function getMessage(category: Category, minutes: number, status: BalanceStatus): string {
  if (status === 'green') {
    if (category === 'escape' && minutes === 0) return es.dashboard.balanceEscapeNone;
    return OK_MESSAGES[category];
  }
  switch (category) {
    case 'academic':
      return minutes < 240 ? es.dashboard.balanceAcademicLow : es.dashboard.balanceAcademicHigh;
    case 'vital':
      return es.dashboard.balanceVitalLow;
    case 'personal':
      return es.dashboard.balancePersonalLow;
    case 'escape':
      return es.dashboard.balanceEscapeHigh;
  }
}

function formatHours(minutes: number): string {
  const h = minutes / 60;
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
}

function getOverallSummary(statuses: BalanceStatus[]): string {
  if (statuses.some((s) => s === 'red')) return es.dashboard.balanceBad;
  if (statuses.some((s) => s === 'amber')) return es.dashboard.balanceWarn;
  return es.dashboard.balanceGood;
}

interface Props {
  plannedMinutes: Record<Category, number>;
  title: string;
}

export function CategoryBalanceInsight({ plannedMinutes, title }: Props) {
  const hasAny = Object.values(plannedMinutes).some((m) => m > 0);
  if (!hasAny) return null;

  const rows = CATEGORY_ORDER.map((cat) => {
    const minutes = plannedMinutes[cat];
    const status = getStatus(cat, minutes);
    const message = getMessage(cat, minutes, status);
    const { icon: Icon, label } = CATEGORY_CONFIG[cat];
    return { cat, minutes, status, message, Icon, label };
  });

  const statuses = rows.map((r) => r.status);
  const overallMessage = getOverallSummary(statuses);
  const hasIssues = statuses.some((s) => s !== 'green');

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card px-4 py-3 shadow-sm overflow-hidden balance-card">
      <h3 className="mb-2 text-xs font-semibold text-muted-foreground">{title}</h3>
      <div className="flex-1 space-y-1.5 balance-card-rows">
        {rows.map((r) => (
          <div key={r.cat} className="flex items-center gap-2.5 balance-card-row">
            <r.Icon className="h-4 w-4 shrink-0 text-muted-foreground balance-card-icon" strokeWidth={1.5} />
            <span className="w-14 sm:w-[4rem] shrink-0 text-[0.6875rem] font-medium">{r.label}</span>
            <span className="w-8 shrink-0 text-right text-[0.625rem] tabular-nums text-muted-foreground">
              {formatHours(r.minutes)}
            </span>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_STYLES[r.status].dot} balance-card-dot`} />
            <span className={`text-[0.6875rem] leading-tight ${STATUS_STYLES[r.status].text}`}>
              {r.message}
            </span>
          </div>
        ))}
      </div>
      {hasIssues && (
        <p className="mt-2 border-t pt-2 text-[0.6875rem] font-medium text-muted-foreground">
          {overallMessage}
        </p>
      )}
    </div>
  );
}
