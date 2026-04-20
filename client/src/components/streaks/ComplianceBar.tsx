interface ComplianceBarProps {
  compliancePct: number;
  passed: boolean;
}

export function ComplianceBar({ compliancePct, passed }: ComplianceBarProps) {
  const isPerfect = compliancePct >= 100;
  const barColor = isPerfect
    ? 'bg-green-500'
    : passed
      ? 'bg-green-500'
      : compliancePct >= 50
        ? 'bg-orange-500'
        : 'bg-red-500';
  const textColor = isPerfect
    ? 'text-green-600'
    : passed
      ? 'text-green-600'
      : compliancePct >= 50
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
          style={{ left: '80%' }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {isPerfect ? '¡Cumplimiento perfecto!' : passed ? '¡Sobre el umbral del 80%!' : compliancePct >= 50 ? 'Te falta un poco más para llegar al 80%' : 'Necesitas >80% para avanzar'}
      </p>
    </div>
  );
}
