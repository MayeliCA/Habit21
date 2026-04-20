import { useSettings } from '@/hooks/useSettings';

interface ComplianceBarProps {
  compliancePct: number;
  passed: boolean;
}

export function ComplianceBar({ compliancePct, passed }: ComplianceBarProps) {
  const { settings } = useSettings();
  const threshold = settings.successThreshold;
  const isAboveThreshold = compliancePct >= threshold;
  const isPerfect = compliancePct >= 100;

  const barColor = isPerfect
    ? 'bg-green-500'
    : isAboveThreshold
      ? 'bg-green-500'
      : compliancePct >= threshold * 0.6
        ? 'bg-orange-500'
        : 'bg-red-500';
  const textColor = isPerfect
    ? 'text-green-600'
    : isAboveThreshold
      ? 'text-green-600'
      : compliancePct >= threshold * 0.6
        ? 'text-orange-600'
        : 'text-red-600';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Cumplimiento</span>
        <span className={`text-sm font-semibold tabular-nums ${textColor}`}>
          {Math.round(compliancePct)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200/70">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(compliancePct, 100)}%` }}
        />
      </div>
      <div className="relative h-0">
        <div
          className="absolute top-0 h-1.5 w-px bg-foreground/30"
          style={{ left: `${threshold}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {isPerfect ? '¡Cumplimiento perfecto!' : isAboveThreshold ? `¡Sobre el umbral del ${threshold}%!` : compliancePct >= threshold * 0.6 ? `Te falta un poco más para llegar al ${threshold}%` : `Necesitas >${threshold}% para avanzar`}
      </p>
    </div>
  );
}
